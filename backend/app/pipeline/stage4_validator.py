import math
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.models.schemas import ValidationReport, ValidationCheck

GENERIC_PLACEHOLDERS = {
    "inv-001", "123", "123456", "[123456]", "xxxxx", "xxx", "temp", "n/a", "unknown", "none", "0", "000"
}

def evaluate_validation(data: Dict[str, Any], doc_id: str = "", conn: sqlite3.Connection = None, raw_text: str = "") -> ValidationReport:
    """
    Stage 4: Deterministic 5-Rule Autonomous Validation Engine.
    Executes:
      0. Document Authenticity & File Integrity Check (Rejects non-financial/corrupted documents)
      1. Missing Mandatory Fields Check (Enforces total > $0.00)
      2. Numeric Sanity Check (Lines == Subtotal, Subtotal + Tax == Total)
      3. Historical Duplicate Collision Detection (Cross-document matching, ignores self re-uploads)
      4. Data Consistency & ISO-8601 Calendar Logic Check
    """
    errors: List[str] = []
    checks: List[ValidationCheck] = []

    # 0. Document Authenticity & File Integrity Check
    is_corrupted = "[CORRUPTED_FILE" in (raw_text or "")
    is_financial = data.get("isFinancialDocument", True)
    doc_type = str(data.get("docType") or "Invoice").strip()
    is_non_financial = (not is_financial) or (doc_type in ["Non-Financial Document", "Unrelated Image", "Academic Paper", "Corrupted File"])

    if is_corrupted:
        checks.append(ValidationCheck(
            id="rule-integrity",
            title="File Integrity Check",
            passed=False,
            message=raw_text[:120] if raw_text else "Document file corrupted or unreadable"
        ))
        errors.append("File Integrity Check: Corrupted document structure detected")
    elif is_non_financial:
        checks.append(ValidationCheck(
            id="rule-authenticity",
            title="Document Authenticity Check",
            passed=False,
            message=f"Rejected: Document is not a recognized commercial invoice or receipt (Classified: {doc_type})"
        ))
        errors.append(f"Document Authenticity Check: Rejected - File is not a recognized commercial invoice or receipt ({doc_type})")
    else:
        checks.append(ValidationCheck(
            id="rule-authenticity",
            title="Document Authenticity Check",
            passed=True,
            message=f"Authentic financial transaction document verified ({doc_type})"
        ))

    # 1. Missing Mandatory Fields Check
    missing = []
    inv_no = str(data.get("invoiceNo") or "").strip()
    vendor = str(data.get("vendor") or "").strip()
    issue_date = str(data.get("issueDate") or "").strip()
    total_val = data.get("total")

    if not inv_no:
        missing.append("Invoice / Ref #")
    if not vendor:
        missing.append("Vendor Name")
    if not issue_date:
        missing.append("Issue Date")
    if total_val is None or (isinstance(total_val, (int, float)) and (math.isnan(total_val) or total_val <= 0.0)):
        missing.append("Valid Total Amount (> $0.00)")

    rule1_passed = len(missing) == 0
    if not rule1_passed:
        errors.append(f"Missing Required Fields: {', '.join(missing)}")

    checks.append(ValidationCheck(
        id="rule-missing",
        title="Missing Fields Check",
        passed=rule1_passed,
        message="All mandatory fields present" if rule1_passed else f"Missing: {', '.join(missing)}"
    ))

    # 2. Numeric Sanity Check
    line_items = data.get("lineItems") or []
    line_sum = sum((float(it.get("qty") or 0)) * (float(it.get("unitPrice") or 0)) for it in line_items)
    subtotal = float(data.get("subtotal") or 0.0)
    tax = float(data.get("tax") or 0.0)
    total = float(data.get("total") or 0.0)

    if is_non_financial or total <= 0.0:
        rule2_passed = False
        rule2_msg = "No positive financial amounts recorded to calculate"
        errors.append("Numeric Sanity: No valid monetary values found")
    else:
        has_items = len(line_items) > 0
        lines_match_sub = (not has_items) or (abs(line_sum - subtotal) < 0.05)
        sub_plus_tax_matches_total = abs((subtotal + tax) - total) < 0.05
        rule2_passed = lines_match_sub and sub_plus_tax_matches_total

        rule2_msg = f"Subtotal (${subtotal:.2f}) + Tax (${tax:.2f}) = Total (${total:.2f})"
        if not lines_match_sub:
            diff = line_sum - subtotal
            rule2_msg = f"Line items sum (${line_sum:.2f}) != Subtotal (${subtotal:.2f}) [Diff: ${diff:.2f}]"
            errors.append(rule2_msg)
        elif not sub_plus_tax_matches_total:
            expected = subtotal + tax
            rule2_msg = f"Math Mismatch: Subtotal (${subtotal:.2f}) + Tax (${tax:.2f}) = ${expected:.2f}, but recorded Total is ${total:.2f}"
            errors.append(rule2_msg)

    checks.append(ValidationCheck(
        id="rule-numeric",
        title="Numeric Calculation Check",
        passed=rule2_passed,
        message=rule2_msg
    ))

    # 3. Historical Duplicate Collision Detection
    rule3_passed = True
    rule3_msg = "No duplicate detected in repository"

    # Identify current filename to prevent flagging re-uploads of the same file as duplicates of itself
    current_filename = ""
    if doc_id and conn:
        try:
            cur_lookup = conn.cursor()
            cur_lookup.execute("SELECT filename FROM documents WHERE id = ?", (doc_id,))
            r_fn = cur_lookup.fetchone()
            if r_fn:
                current_filename = r_fn["filename"]
        except Exception:
            pass

    clean_inv = inv_no.lower().strip()
    is_placeholder_inv = clean_inv in GENERIC_PLACEHOLDERS or len(clean_inv) < 3

    if inv_no and vendor and conn and not is_placeholder_inv and total > 0.0:
        try:
            cursor = conn.cursor()
            query = """
            SELECT d.filename, sr.total FROM structured_results sr
            JOIN documents d ON sr.doc_id = d.id
            WHERE LOWER(sr.invoice_no) = LOWER(?)
              AND LOWER(sr.vendor) = LOWER(?)
              AND sr.doc_id != ?
            """
            params = [inv_no, vendor, doc_id]
            if current_filename:
                query += " AND d.filename != ?"
                params.append(current_filename)
            query += " LIMIT 1"

            cursor.execute(query, tuple(params))
            duplicate_row = cursor.fetchone()
            if duplicate_row:
                other_total = float(duplicate_row["total"] or 0.0)
                if abs(other_total - total) < 0.05 or other_total == 0:
                    rule3_passed = False
                    rule3_msg = f"Duplicate invoice #{inv_no} already exists in {duplicate_row['filename']}"
                    errors.append(rule3_msg)
        except Exception as e:
            rule3_msg = f"Duplicate check skipped: {e}"

    checks.append(ValidationCheck(
        id="rule-duplicate",
        title="Duplicate Detection Check",
        passed=rule3_passed,
        message=rule3_msg
    ))

    # 4. Data Consistency & ISO-8601 Calendar Check
    rule4_passed = False
    rule4_msg = "Invalid date format"
    if issue_date:
        try:
            parsed = datetime.strptime(issue_date, "%Y-%m-%d")
            max_future = datetime.now() + timedelta(days=45)
            if parsed > max_future:
                rule4_msg = f"Issue date ({issue_date}) is abnormally far in the future"
                errors.append(rule4_msg)
            else:
                rule4_passed = True
                rule4_msg = f"Valid calendar date ({issue_date})"
        except ValueError:
            rule4_msg = f"Date '{issue_date}' does not conform to YYYY-MM-DD"
            errors.append(rule4_msg)
    else:
        rule4_msg = "No issue date provided"

    checks.append(ValidationCheck(
        id="rule-date",
        title="Data Consistency Check",
        passed=rule4_passed,
        message=rule4_msg
    ))

    overall_passed = all(c.passed for c in checks)

    return ValidationReport(
        passed=overall_passed,
        status="VALID" if overall_passed else "FLAGGED",
        errors=errors,
        checks=checks
    )
