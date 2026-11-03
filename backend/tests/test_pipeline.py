import pytest
from app.pipeline.stage4_validator import evaluate_validation
from app.pipeline.stage3_ai_gemini import extract_with_heuristic_rules
from app.pipeline.stage5_indexer import perform_search
from app.database import init_db

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_validation_passes_for_clean_document():
    clean_data = {
        "docType": "Invoice",
        "invoiceNo": "INV-TEST-001",
        "vendor": "Clean Vendor Inc",
        "issueDate": "2026-10-20",
        "currency": "USD",
        "subtotal": 1000.0,
        "tax": 100.0,
        "total": 1100.0,
        "lineItems": [
            {"description": "Server hosting", "qty": 2, "unitPrice": 500.0}
        ]
    }
    report = evaluate_validation(clean_data)
    assert report.passed is True
    assert report.status == "VALID"
    assert len(report.errors) == 0

def test_validation_flags_missing_fields():
    data = {
        "docType": "Invoice",
        "invoiceNo": "",  # missing!
        "vendor": "",     # missing!
        "issueDate": "2026-10-20",
        "total": 100.0,
        "lineItems": []
    }
    report = evaluate_validation(data)
    assert report.passed is False
    assert report.status == "FLAGGED"
    assert any("Missing Required Fields" in err for err in report.errors)

def test_validation_flags_numeric_calculation_mismatch():
    data = {
        "docType": "Receipt",
        "invoiceNo": "RCP-990",
        "vendor": "Apex Hardware",
        "issueDate": "2026-10-22",
        "subtotal": 1000.0,
        "tax": 150.0,
        "total": 1210.0,  # 1000 + 150 = 1150 != 1210 (discrepancy)
        "lineItems": [
            {"description": "Monitor", "qty": 2, "unitPrice": 420.0},
            {"description": "Mount", "qty": 2, "unitPrice": 80.0}
        ]
    }
    report = evaluate_validation(data)
    assert report.passed is False
    assert report.status == "FLAGGED"
    assert any("Math Mismatch" in err for err in report.errors)

def test_heuristic_extractor_parses_sample_invoice():
    sample_text = (
        "INVOICE #INV-2026-7788\n"
        "Vendor: DeepCompute AI Inc.\n"
        "Date: 2026-10-25\n"
        "1. GPU H100 Pod (x2) @ $500.00 = $1,000.00\n"
        "Subtotal: $1,000.00\n"
        "Tax: $100.00\n"
        "Total: $1,100.00"
    )
    result = extract_with_heuristic_rules(sample_text)
    assert result["invoiceNo"] == "INV-2026-7788"
    assert "DeepCompute" in result["vendor"]
    assert result["subtotal"] == 1000.0
    assert result["total"] == 1100.0

def test_validation_flags_corrupted_file():
    corrupted_data = {
        "docType": "Corrupted File",
        "invoiceNo": "N/A",
        "vendor": "Unknown",
        "issueDate": "2026-10-20",
        "total": 0.0,
        "lineItems": []
    }
    report = evaluate_validation(corrupted_data, raw_text="[CORRUPTED_FILE: Corrupted PDF file structure]")
    assert report.passed is False
    assert report.status == "FLAGGED"
    assert any("File Integrity Check" in c.title for c in report.checks)
    assert any(not c.passed for c in report.checks if c.title == "File Integrity Check")

def test_csv_fast_path_extraction(tmp_path):
    import time
    from app.pipeline.stage3_ai_gemini import extract_structured_entities_with_gemini
    from app.pipeline.stage2_extractor import extract_text_and_confidence

    csv_file = tmp_path / "expenses_speed_test.csv"
    csv_file.write_text(
        "item,quantity,rate,total\n"
        "Server Instance,2,300.00,600.00\n"
        "Storage Bucket,1,50.00,50.00\n"
        "Subtotal,,,650.00\n"
        "Tax,,,65.00\n"
        "Total,,,715.00\n"
        "Invoice: CSV-2026-909\n"
        "Vendor: SwiftCloud Express\n"
        "Date: 2026-11-01\n"
    )

    t0 = time.time()
    txt, eng, conf = extract_text_and_confidence(str(csv_file), "CSV")
    data = extract_structured_entities_with_gemini(txt, "expenses_speed_test.csv", str(csv_file))
    elapsed = time.time() - t0

    assert elapsed < 0.5  # Sub-second fast-path
    assert data["invoiceNo"] == "CSV-2026-909"
    assert "SwiftCloud Express" in data["vendor"]
    assert data["subtotal"] == 650.0
    assert data["tax"] == 65.0
    assert data["total"] == 715.0
    assert len(data["lineItems"]) >= 2

def test_validation_flags_non_financial_document():
    """Verify Rule 0 flags non-financial documents (e.g. academic paper, cat photo)."""
    non_fin_data = {
        "isFinancialDocument": False,
        "docType": "Non-Financial Document",
        "invoiceNo": "",
        "vendor": "",
        "issueDate": "",
        "total": 0.0,
        "lineItems": []
    }
    report = evaluate_validation(non_fin_data)
    assert report.passed is False
    assert report.status == "FLAGGED"
    auth_check = next((c for c in report.checks if c.id == "rule-authenticity"), None)
    assert auth_check is not None
    assert auth_check.passed is False
    assert "Rejected" in auth_check.message

def test_smart_duplicate_ignores_same_filename_reupload():
    """Verify smart duplicate detection does not flag a file against itself upon re-upload."""
    from app.database import get_connection
    conn = get_connection()
    doc_data = {
        "isFinancialDocument": True,
        "docType": "Invoice",
        "invoiceNo": "INV-2026-0891",
        "vendor": "Nimbus Cloud Systems Ltd.",
        "issueDate": "2026-10-31",
        "subtotal": 1500.0,
        "tax": 150.0,
        "total": 1650.0,
        "lineItems": [{"description": "Cloud VM", "qty": 1, "unitPrice": 1500.0}]
    }
    # doc-001 is 'INV-2026-0891_Digital.pdf' in DB.
    # Evaluating doc-001 with conn should pass duplicate check (not flag against itself)
    report = evaluate_validation(doc_data, doc_id="doc-001", conn=conn)
    conn.close()

    dupe_check = next((c for c in report.checks if c.id == "rule-duplicate"), None)
    assert dupe_check is not None
    assert dupe_check.passed is True




