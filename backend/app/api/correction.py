from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.database import fetch_document_by_id, save_full_document
from app.models.schemas import DocumentResponse, DocumentCorrectionRequest
from app.pipeline.stage4_validator import evaluate_validation

router = APIRouter(tags=["Correction API"])

@router.put("/documents/{doc_id}", response_model=DocumentResponse)
async def correct_document_values(doc_id: str, payload: DocumentCorrectionRequest):
    """
    Correction API: Allows human operators to review and manually correct
    extracted values, resolving validation discrepancies and committing to SQLite.
    """
    doc = fetch_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")

    # Merge incoming corrections with existing values
    current_data = doc.data.model_dump()

    if payload.docType is not None:
        current_data["docType"] = payload.docType
    if payload.invoiceNo is not None:
        current_data["invoiceNo"] = payload.invoiceNo
    if payload.vendor is not None:
        current_data["vendor"] = payload.vendor
    if payload.customer is not None:
        current_data["customer"] = payload.customer
    if payload.issueDate is not None:
        current_data["issueDate"] = payload.issueDate
    if payload.currency is not None:
        current_data["currency"] = payload.currency
    if payload.subtotal is not None:
        current_data["subtotal"] = payload.subtotal
    if payload.tax is not None:
        current_data["tax"] = payload.tax
    if payload.total is not None:
        current_data["total"] = payload.total
    if payload.lineItems is not None:
        current_data["lineItems"] = [it.model_dump() for it in payload.lineItems]

    # Re-evaluate validation rules
    val_report = evaluate_validation(current_data, doc_id)

    # Append to audit history
    history = [h.model_dump() for h in doc.history]
    history.append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "stage": "Human-in-the-Loop Review",
        "engine": "Human Operator",
        "detail": "Approved and validated by operator" if val_report.passed else f"Updated values: {val_report.errors[0] if val_report.errors else 'Flagged'}"
    })

    updated_doc_dict = {
        "id": doc.id,
        "filename": doc.filename,
        "format": doc.format,
        "subType": doc.subType,
        "sizeKb": doc.sizeKb,
        "engine": doc.engine,
        "ocrConfidence": doc.ocrConfidence,
        "stage": 5,
        "progress": 100,
        "status": val_report.status,
        "uploadTime": doc.uploadTime,
        "semanticTags": doc.semanticTags,
        "extractedText": doc.extractedText,
        "data": current_data,
        "history": history
    }

    save_full_document(updated_doc_dict)

    updated_doc = fetch_document_by_id(doc_id)
    return updated_doc

