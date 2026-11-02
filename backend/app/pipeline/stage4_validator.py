import math
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.models.schemas import ValidationReport, ValidationCheck

def evaluate_validation(data: Dict[str, Any], doc_id: str = "", conn: sqlite3.Connection = None, raw_text: str = "") -> ValidationReport:
    """
    Stage 4: Deterministic 4-Rule Validation Engine.
    Executes:
      0. File Integrity Check (Corrupted/Unreadable stream)
      1. Missing Fields Check
      2. Numeric Calculation Check
      3. Duplicate Invoice Detection
      4. Data Consistency / Date Logic Check
    """
    errors: List[str] = []
    checks: List[ValidationCheck] = []

    # 0. File Integrity Check
    if "[CORRUPTED_FILE" in (raw_text or ""):
        checks.append(ValidationCheck(
            id="rule-integrity",
            title="File Integrity Check",
            passed=False,
            message=raw_text[:120] if raw_text else "Document file corrupted or unreadable"
        ))
        errors.append("File Integrity Check: Corrupted document structure detected")

    # 1. Missing Fields Check
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
    if total_val is None or (isinstance(total_val, (int, float)) and math.isnan(total_val)):
        missing.append("Total Amount")

    rule1_passed = len(missing) == 0
    if not rule1_passed:
        errors.append(f"Missing Required Fields: {', '.join(missing)}")

    checks.append(ValidationCheck(
        id="rule-missing",
        title="Missing Fields Check",
        passed=rule1_passed,
        message="All mandatory fields present" if rule1_passed else f"Missing: {', '.join(missing)}"
    ))

    # 2. Numeric Calculation Check
    line_items = data.get("lineItems") or []
    line_sum = sum((float(it.get("qty") or 0)) * (float(it.get("unitPrice") or 0)) for it in line_items)
    subtotal = float(data.get("subtotal") or 0.0)
    tax = float(data.get("tax") or 0.0)
    total = float(data.get("total") or 0.0)

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

    # 3. Duplicate Invoice Detection
    rule3_passed = True
    rule3_msg = "No duplicate detected in repository"

    if inv_no and conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT d.filename FROM structured_results sr
            JOIN documents d ON sr.doc_id = d.id
            WHERE LOWER(sr.invoice_no) = LOWER(?)
              AND LOWER(sr.vendor) = LOWER(?)
              AND sr.doc_id != ?
            LIMIT 1
            """, (inv_no, vendor, doc_id))
            duplicate_row = cursor.fetchone()
            if duplicate_row:
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

    # 4. Data Consistency & Date Logic Check
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

