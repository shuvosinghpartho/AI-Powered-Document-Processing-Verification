from fastapi import APIRouter, HTTPException, Query
from app.database import fetch_document_by_id

router = APIRouter(tags=["Cross Verification API"])

@router.get("/cross-verify")
async def cross_verify_documents(
    doc_a_id: str = Query(..., description="ID of first document (e.g. PDF Invoice)"),
    doc_b_id: str = Query(..., description="ID of second document (e.g. Excel PO or PDF)")
):
    """
    Cross Verification Engine (PDF - PDF, PDF - Excel, Excel - CSV).
    Compares two documents for financial discrepancies, vendor reconciliation,
    and line-item cross verification.
    """
    doc_a = fetch_document_by_id(doc_a_id)
    doc_b = fetch_document_by_id(doc_b_id)

    if not doc_a or not doc_b:
        raise HTTPException(status_code=404, detail="One or both documents not found in repository.")

    data_a = doc_a.data
    data_b = doc_b.data

    discrepancies = []
    field_comparisons = []

    # 1. Vendor Comparison
    v_a = (data_a.vendor or "").strip().lower()
    v_b = (data_b.vendor or "").strip().lower()
    vendor_match = (v_a == v_b) or (v_a in v_b) or (v_b in v_a)
    if not vendor_match and v_a and v_b:
        discrepancies.append(f"Vendor Mismatch: '{data_a.vendor}' vs '{data_b.vendor}'")
    field_comparisons.append({
        "field": "Vendor / Supplier",
        "docA": data_a.vendor or "N/A",
        "docB": data_b.vendor or "N/A",
        "match": vendor_match
    })

    # 2. Reference / Invoice Number Comparison
    inv_a = (data_a.invoiceNo or "").strip().lower()
    inv_b = (data_b.invoiceNo or "").strip().lower()
    ref_match = (inv_a == inv_b) or (inv_a in inv_b) or (inv_b in inv_a) if (inv_a and inv_b) else False
    field_comparisons.append({
        "field": "Invoice / PO Reference",
        "docA": data_a.invoiceNo or "N/A",
        "docB": data_b.invoiceNo or "N/A",
        "match": ref_match
    })

    # 3. Currency Comparison
    curr_match = (data_a.currency or "USD").upper() == (data_b.currency or "USD").upper()
    field_comparisons.append({
        "field": "Currency",
        "docA": data_a.currency or "USD",
        "docB": data_b.currency or "USD",
        "match": curr_match
    })

    # 4. Total Amount Cross-Verification
    total_diff = abs(data_a.total - data_b.total)
    total_match = total_diff < 0.05
    if not total_match:
        discrepancies.append(f"Total Amount Discrepancy: ${data_a.total:.2f} ({doc_a.filename}) vs ${data_b.total:.2f} ({doc_b.filename}) [Diff: ${total_diff:.2f}]")
    field_comparisons.append({
        "field": "Total Amount",
        "docA": f"${data_a.total:.2f}",
        "docB": f"${data_b.total:.2f}",
        "match": total_match
    })

    # 5. Subtotal Comparison
    sub_diff = abs(data_a.subtotal - data_b.subtotal)
    sub_match = sub_diff < 0.05
    field_comparisons.append({
        "field": "Subtotal",
        "docA": f"${data_a.subtotal:.2f}",
        "docB": f"${data_b.subtotal:.2f}",
        "match": sub_match
    })

    # Calculate overall match score
    passed_fields = sum(1 for f in field_comparisons if f["match"])
    score = round((passed_fields / len(field_comparisons)) * 100, 1)
    is_verified = len(discrepancies) == 0

    return {
        "docA": {
            "id": doc_a.id,
            "filename": doc_a.filename,
            "format": doc_a.format,
            "total": data_a.total
        },
        "docB": {
            "id": doc_b.id,
            "filename": doc_b.filename,
            "format": doc_b.format,
            "total": data_b.total
        },
        "verificationType": f"{doc_a.format} - {doc_b.format} Cross-Check",
        "matchScore": score,
        "status": "VERIFIED_MATCH" if is_verified else "DISCREPANCY_FLAGGED",
        "isVerified": is_verified,
        "discrepancies": discrepancies,
        "fieldComparisons": field_comparisons
    }

