import pytest
from app.config import settings
from app.pipeline.stage2_extractor import extract_text_and_confidence
from app.pipeline.stage3_ai_gemini import extract_structured_entities_with_gemini
from app.database import get_connection
from app.pipeline.stage4_validator import evaluate_validation

def test_gemini_api_key_configured():
    assert settings.GEMINI_API_KEY.startswith("AQ.")
    assert len(settings.GEMINI_API_KEY) > 20
    assert settings.GEMINI_MODEL == "gemini-3.5-flash-lite"

def test_gemini_converts_text_to_structured_json():
    """Verify Gemini API converts unstructured text into strict JSON schema."""
    sample_text = """
    INVOICE #INV-GEMINI-2026
    Vendor: Google Cloud Systems Inc.
    Date: 2026-10-31
    Currency: USD

    1. Vertex AI Enterprise Quota x 2 @ $500.00 = $1,000.00
    2. Cloud Storage Multi-Region @ $100.00 = $100.00

    Subtotal: $1,100.00
    Tax: $110.00
    Total Due: $1,210.00
    """
    data = extract_structured_entities_with_gemini(sample_text, "gemini_test_invoice.pdf")
    
    assert data["docType"] in ["Invoice", "Receipt", "Purchase Order", "Expense Log"]
    assert "INV-GEMINI-2026" in data["invoiceNo"]
    assert "Google Cloud Systems" in data["vendor"]
    assert data["subtotal"] == 1100.0
    assert data["tax"] == 110.0
    assert data["total"] == 1210.0
    assert len(data["lineItems"]) >= 1

def test_stage2_ocr_formats():
    """Verify Stage 2 OCR handling for multiple document types."""
    # 1. Non-existent file safety
    txt, eng, conf = extract_text_and_confidence("/tmp/nonexistent.pdf", "PDF")
    assert txt == ""
    assert conf == 0.0

    # 2. CSV parsing
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".csv", mode="w", delete=False) as f:
        f.write("colA,colB\n10,20\n")
        f_path = f.name
    
    c_txt, c_eng, c_conf = extract_text_and_confidence(f_path, "CSV")
    assert "colA" in c_txt
    assert c_conf == 100.0

def test_validation_rules_on_gemini_output():
    """Verify 4 validation rules run deterministically on Gemini-extracted output."""
    sample_data = {
        "docType": "Invoice",
        "invoiceNo": "INV-VALID-01",
        "vendor": "Test Vendor LLC",
        "issueDate": "2026-10-31",
        "currency": "USD",
        "subtotal": 500.0,
        "tax": 50.0,
        "total": 550.0,
        "lineItems": [{"description": "Test Item", "qty": 1.0, "unitPrice": 500.0}]
    }
    conn = get_connection()
    report = evaluate_validation(sample_data, "test-doc-id-999", conn)
    conn.close()

    assert report.passed is True
    assert report.status == "VALID"
    assert len(report.errors) == 0

