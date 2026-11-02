import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.config import settings
from app.database import fetch_document_by_id, save_full_document, get_connection
from app.workers.pipeline_worker import run_document_pipeline_sync

router = APIRouter(tags=["Reprocess API"])

@router.post("/documents/{doc_id}/reprocess")
@router.post("/reprocess/{doc_id}")
async def reprocess_document(doc_id: str, background_tasks: BackgroundTasks):
    """
    Reprocess API: Re-runs Gemini AI Extraction and deterministic
    validation checks through the async pipeline worker.
    """
    doc = fetch_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")

    conn = get_connection()
    row = conn.execute("SELECT file_path FROM documents WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    file_path = row["file_path"] if row and row["file_path"] else ""

    if not file_path or not os.path.exists(file_path):
        cand1 = settings.UPLOAD_DIR / f"{doc.id}_{doc.filename}"
        cand2 = Path("test-invoices") / doc.filename
        cand3 = settings.UPLOAD_DIR / doc.filename
        if cand1.exists():
            file_path = str(cand1)
        elif cand2.exists():
            file_path = str(cand2)
        elif cand3.exists():
            file_path = str(cand3)

    doc_dict = {
        "id": doc.id,
        "filename": doc.filename,
        "file_path": file_path,
        "format": doc.format,
        "subType": doc.subType,
        "sizeKb": doc.sizeKb,
        "engine": doc.engine,
        "ocrConfidence": doc.ocrConfidence,
        "stage": 2,
        "progress": 30,
        "status": "PROCESSING",
        "uploadTime": doc.uploadTime,
        "semanticTags": doc.semanticTags,
        "extractedText": doc.extractedText,
        "data": doc.data.model_dump(),
        "history": [h.model_dump() for h in doc.history]
    }

    # Mark as processing
    save_full_document(doc_dict)

    # Dispatch to background task
    background_tasks.add_task(run_document_pipeline_sync, doc_dict)

    return {
        "id": doc.id,
        "status": "PROCESSING",
        "message": f"Reprocessing {doc.filename} through EasyOCR & Gemini API pipeline..."
    }

