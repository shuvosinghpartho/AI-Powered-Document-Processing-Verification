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


