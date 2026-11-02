import os
import glob
import uuid
import shutil
from pathlib import Path
from typing import List
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from app.config import settings
from app.pipeline.stage1_ingest import ingest_file
from app.workers.pipeline_worker import run_document_pipeline_sync
from app.database import save_full_document, fetch_document_by_id

router = APIRouter(tags=["Upload API"])

@router.post("/upload", response_model=List[dict])
async def upload_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...)
):
    """
    Upload API: Ingests multiple documents (.pdf, .png, .jpg, .xlsx, .csv)
    and dispatches asynchronous background worker pipeline.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    enqueued_docs = []

    for file in files:
        doc_dict = ingest_file(file)
        # Register initial state in SQLite
        save_full_document(doc_dict)
        # Kick off background pipeline worker
        background_tasks.add_task(run_document_pipeline_sync, doc_dict)
        enqueued_docs.append({
            "id": doc_dict["id"],
            "filename": doc_dict["filename"],
            "format": doc_dict["format"],
            "status": "PROCESSING",
            "message": "Enqueued for autonomous extraction & validation"
        })

    return enqueued_docs

@router.post("/test-invoices/ingest", response_model=List[dict])
async def ingest_test_invoices_batch(background_tasks: BackgroundTasks):
    """
    Ingests all real test invoices from the 'test-invoices' folder
    and processes them directly through the EasyOCR & Gemini pipeline.
    """
    test_dir = Path("test-invoices")
    if not test_dir.exists():
        raise HTTPException(status_code=404, detail="test-invoices folder not found on disk.")

    files = sorted(test_dir.glob("*.*"))
    if not files:
        raise HTTPException(status_code=404, detail="No test invoice files found in test-invoices folder.")

    enqueued_docs = []

    for file_path in files:
        original_filename = file_path.name
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"
        saved_filename = f"{doc_id}_{original_filename}"
        saved_path = settings.UPLOAD_DIR / saved_filename

        shutil.copyfile(str(file_path), str(saved_path))
        size_kb = max(1, round(os.path.getsize(saved_path) / 1024))
        ext = file_path.suffix.lower()

        doc_dict = {
            "id": doc_id,
            "filename": original_filename,
            "file_path": str(saved_path),
            "format": "IMAGE",
            "subType": f"Vision Scan ({ext.replace('.', '').upper()})",
            "sizeKb": size_kb,
            "engine": "EasyOCR Vision Engine",
            "ocrConfidence": 85.0,
            "stage": 1,
            "progress": 20,
            "status": "PROCESSING",
            "uploadTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "semanticTags": ["test-invoices", "easyocr"],
            "extractedText": f"Running EasyOCR extraction on {original_filename}...",
            "data": {
                "docType": "Invoice",
                "invoiceNo": "Extracting...",
                "vendor": "Extracting...",
                "customer": "",
                "issueDate": "",
                "currency": "USD",
                "subtotal": 0.0,
                "tax": 0.0,
                "total": 0.0,
                "lineItems": []
            },
            "history": [
                {
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "stage": "Stage 1: Document Ingestion",
                    "engine": "Upload Gateway",
                    "detail": f"Loaded {original_filename} from test-invoices"
                }
            ]
        }

        save_full_document(doc_dict)
        background_tasks.add_task(run_document_pipeline_sync, doc_dict)
        enqueued_docs.append({
            "id": doc_id,
            "filename": original_filename,
            "format": "IMAGE",
            "status": "PROCESSING",
            "message": "Enqueued for EasyOCR and Gemini extraction"
        })

    return enqueued_docs

