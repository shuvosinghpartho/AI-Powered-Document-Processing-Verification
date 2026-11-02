from fastapi import APIRouter, HTTPException
from app.database import fetch_document_by_id
from app.models.schemas import PipelineStatusResponse

router = APIRouter(tags=["Status API"])

STAGE_NAMES = {
    1: "Stage 1: Document Ingest",
    2: "Stage 2: Text Extraction / OCR",
    3: "Stage 3: AI Information Extraction (Gemini)",
    4: "Stage 4: Data Validation",
    5: "Stage 5: Save & Search Index"
}

@router.get("/status/{doc_id}", response_model=PipelineStatusResponse)
async def get_document_status(doc_id: str):
    """
    Status API: Returns real-time progress percentage, active stage,
    and history logs for a processing document.
    """
    doc = fetch_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")

    return PipelineStatusResponse(
        id=doc.id,
        filename=doc.filename,
        stage=doc.stage,
        progress=doc.progress,
        status=doc.status,
        currentStageName=STAGE_NAMES.get(doc.stage, "Pipeline Completed"),
        history=doc.history
    )

