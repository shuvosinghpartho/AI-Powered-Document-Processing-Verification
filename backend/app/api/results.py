from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.database import fetch_all_documents, fetch_document_by_id, delete_document_by_id
from app.models.schemas import DocumentResponse

router = APIRouter(tags=["Results API"])

@router.get("/documents", response_model=List[DocumentResponse])
async def list_documents(
    format: Optional[str] = Query(default="ALL", description="Filter by format (PDF, IMAGE, EXCEL, CSV, ALL)"),
    status: Optional[str] = Query(default="ALL", description="Filter by status (VALID, FLAGGED, PROCESSING, ALL)")
):
    """
    Results API: Returns all processed documents with metadata,
    extracted structured entities, and validation reports.
    """
    return fetch_all_documents(format_filter=format, status_filter=status)

@router.get("/documents/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: str):
    """
    Results API: Returns detailed extracted information, raw OCR text,
    and 4-rule validation report for a specific document.
    """
    doc = fetch_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")
    return doc

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Deletes a document from SQLite and removes associated data."""
    success = delete_document_by_id(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")
    return {"message": f"Document '{doc_id}' deleted successfully."}

