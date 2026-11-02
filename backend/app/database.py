import sqlite3
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
from app.config import settings
from app.models.schemas import (
    DocumentResponse, 
    ExtractedData, 
    LineItem, 
    ValidationReport, 
    ValidationCheck, 
    HistoryEntry
)

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(settings.DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite schema for the Document Intelligence System."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Document Metadata Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_path TEXT,
        format TEXT NOT NULL,
        sub_type TEXT,
        size_kb INTEGER DEFAULT 0,
        engine TEXT,
        ocr_confidence REAL DEFAULT 0.0,
        stage INTEGER DEFAULT 1,
        progress INTEGER DEFAULT 0,
        status TEXT DEFAULT 'PROCESSING',
        upload_time TEXT,
        semantic_tags_json TEXT DEFAULT '[]'
    )
    """)

    # 2. Extracted Text Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS extracted_text (
        doc_id TEXT PRIMARY KEY,
        raw_text TEXT,
        FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
    )
    """)

    # 3. Structured Results Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS structured_results (
        doc_id TEXT PRIMARY KEY,
        doc_type TEXT DEFAULT 'Invoice',
        invoice_no TEXT,
        vendor TEXT,
        customer TEXT DEFAULT '',
        issue_date TEXT,
        currency TEXT DEFAULT 'USD',
        subtotal REAL DEFAULT 0.0,
        tax REAL DEFAULT 0.0,
        total REAL DEFAULT 0.0,
        line_items_json TEXT DEFAULT '[]',
        FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
    )
    """)

    # Ensure customer column exists for schema migration
    try:
        cursor.execute("ALTER TABLE structured_results ADD COLUMN customer TEXT DEFAULT ''")
    except Exception:
        pass

    # 4. Validation Errors Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS validation_errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id TEXT,
        check_id TEXT,
        check_title TEXT,
        passed INTEGER,
        error_message TEXT,
        FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
    )
    """)

    # 5. Processing History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS processing_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id TEXT,
        timestamp TEXT,
        stage TEXT,
        engine TEXT,
        detail TEXT,
        FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
    )
    """)

    conn.commit()

    # Seed with initial records if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM documents")
    count = cursor.fetchone()["cnt"]
    if count == 0:
        seed_initial_data(conn)

    conn.close()

def seed_initial_data(conn: sqlite3.Connection):
    """Seeds the SQLite database with rich initial multi-format documents."""
    from app.pipeline.stage4_validator import evaluate_validation

    sample_docs = [
        {
            "id": "doc-101",
            "filename": "INV-2026-0891_Digital.pdf",
            "format": "PDF",
            "subType": "Digital Native PDF",
            "sizeKb": 248,
            "engine": "PyMuPDF Direct Text Parser",
            "ocrConfidence": 99.4,
            "stage": 5,
            "progress": 100,
            "status": "VALID",
            "uploadTime": "2026-10-31 09:15:02",
            "semanticTags": ["cloud infrastructure", "gpu inference", "managed postgresql", "nimbus cloud", "aws"],
            "extractedText": "INVOICE #INV-2026-0891\nVendor: Nimbus Cloud Systems Ltd.\nTax ID: US-EIN-88219401\nDate: 2026-10-18\nCurrency: USD\nDue Date: 2026-11-18\n\nLine Items:\n1. Dedicated GPU Inference Node (H100 SXM5) - Qty: 2 @ $600.00 = $1,200.00\n2. Managed PostgreSQL & pgvector Cluster - Qty: 1 @ $300.00 = $300.00\n\nFinancial Summary:\nSubtotal: $1,500.00\nTax (Sales 10.0%): $150.00\nTotal Due: $1,650.00\nStatus: UNPAID (Net 30)",
            "data": {
                "docType": "Invoice",
                "invoiceNo": "INV-2026-0891",
                "vendor": "Nimbus Cloud Systems Ltd.",
                "issueDate": "2026-10-18",
                "currency": "USD",
                "subtotal": 1500.00,
                "tax": 150.00,
                "total": 1650.00,
                "lineItems": [
                    {"description": "Dedicated GPU Inference Node (H100 SXM5)", "qty": 2, "unitPrice": 600.00},
                    {"description": "Managed PostgreSQL & pgvector Cluster", "qty": 1, "unitPrice": 300.00}
                ]
            },
            "history": [
                {"time": "09:15:02", "stage": "Stage 1: Document Ingestion", "engine": "Upload Gateway", "detail": "Received Digital PDF (248 KB, MD5 verified)"},
                {"time": "09:15:03", "stage": "Stage 2: Text Extraction", "engine": "PyMuPDF Engine", "detail": "Extracted digital text stream (Confidence: 99.4%)"},
                {"time": "09:15:05", "stage": "Stage 3: AI Extraction", "engine": "Gemini 2.5 Flash", "detail": "Structured entities & 2 line items parsed via Schema"},
                {"time": "09:15:06", "stage": "Stage 4: Validation Engine", "engine": "Deterministic Rule Engine", "detail": "All 4 validation checks passed successfully"},
                {"time": "09:15:06", "stage": "Stage 5: SQLite Storage", "engine": "DocStore & Embeddings", "detail": "Indexed in SQLite and stored 768d text embeddings"}
            ]
        },
        {
            "id": "doc-102",
            "filename": "Scan_Receipt_ApexHardware.png",
            "format": "IMAGE",
            "subType": "Scanned Receipt Image",
            "sizeKb": 1420,
            "engine": "EasyOCR Vision Pipeline",
            "ocrConfidence": 87.2,
            "stage": 5,
            "progress": 100,
            "status": "FLAGGED",
            "uploadTime": "2026-10-31 09:18:14",
            "semanticTags": ["hardware procurement", "4k monitor", "desk mount", "display", "math discrepancy"],
            "extractedText": "[EasyOCR Scan Output - Confidence 87.2%]\nAPEX OFFICE HARDWARE & DISPLAYS\nTax ID: 94-2018442\nReceipt / Tax Invoice No: APX-99412\nDate: 2026-10-22\n\nItems Charged:\n- 4K UltraSharp 27\" USB-C Monitor | Qty: 2 @ $420.00 = $840.00\n- Ergonomic Heavy-Duty Desk Mount Arm | Qty: 2 @ $80.00 = $160.00\n\nSubtotal: $1,000.00\nVAT (15%): $150.00\nTOTAL AMOUNT CHARGED: $1,210.00  <-- [OCR smudge misread: $1,150.00 as $1,210.00]",
            "data": {
                "docType": "Receipt",
                "invoiceNo": "APX-99412",
                "vendor": "Apex Office Hardware & Displays",
                "issueDate": "2026-10-22",
                "currency": "USD",
                "subtotal": 1000.00,
                "tax": 150.00,
                "total": 1210.00,
                "lineItems": [
                    {"description": "4K UltraSharp 27\" USB-C Monitor", "qty": 2, "unitPrice": 420.00},
                    {"description": "Ergonomic Heavy-Duty Desk Mount Arm", "qty": 2, "unitPrice": 80.00}
                ]
            },
            "history": [
                {"time": "09:18:14", "stage": "Stage 1: Document Ingestion", "engine": "Upload Gateway", "detail": "Received PNG Image (1,420 KB)"},
                {"time": "09:18:16", "stage": "Stage 2: OCR Extraction", "engine": "EasyOCR Model", "detail": "Extracted text via optical character recognition (Confidence: 87.2%)"},
                {"time": "09:18:18", "stage": "Stage 3: AI Extraction", "engine": "Gemini 2.5 Flash", "detail": "Extracted JSON schema with detected numbers"},
                {"time": "09:18:19", "stage": "Stage 4: Validation Engine", "engine": "Deterministic Rule Engine", "detail": "FLAGGED: Numeric Calculation Mismatch ($1,000.00 + $150.00 != $1,210.00)"}
            ]
        },
        {
            "id": "doc-103",
            "filename": "Q4_Procurement_Order.xlsx",
            "format": "EXCEL",
            "subType": "Excel Spreadsheet",
            "sizeKb": 84,
            "engine": "Pandas + OpenPyXL Parser",
            "ocrConfidence": 100.0,
            "stage": 5,
            "progress": 100,
            "status": "VALID",
            "uploadTime": "2026-10-31 09:20:01",
            "semanticTags": ["software licenses", "analytics", "dataforge", "enterprise bi", "procurement"],
            "extractedText": "[Pandas Tabular Dump - Sheet: PO_Summary]\nPurchase Order Number: PO-2026-4410\nVendor Entity: DataForge Analytics Inc.\nEffective Date: 2026-10-25\nCurrency: USD\n\nLine Item Rows:\nRow 1: Enterprise BI Seat License | Qty: 10 | Unit: $95.00 | LineTotal: $950.00\nRow 2: Automated Connector Addon | Qty: 1 | Unit: $250.00 | LineTotal: $250.00\n\nSubtotal: $1,200.00\nTax (5%): $60.00\nTotal Order Value: $1,260.00",
            "data": {
                "docType": "Purchase Order",
                "invoiceNo": "PO-2026-4410",
                "vendor": "DataForge Analytics Inc.",
                "issueDate": "2026-10-25",
                "currency": "USD",
                "subtotal": 1200.00,
                "tax": 60.00,
                "total": 1260.00,
                "lineItems": [
                    {"description": "Enterprise BI Seat License", "qty": 10, "unitPrice": 95.00},
                    {"description": "Automated Connector Addon", "qty": 1, "unitPrice": 250.00}
                ]
            },
            "history": [
                {"time": "09:20:01", "stage": "Stage 1: Document Ingestion", "engine": "Upload Gateway", "detail": "Received Excel Workbook (.xlsx, 84 KB)"},
                {"time": "09:20:02", "stage": "Stage 2: Tabular Extraction", "engine": "Pandas + OpenPyXL", "detail": "Parsed multi-cell dataframes without OCR noise (100% precision)"},
                {"time": "09:20:03", "stage": "Stage 3: AI Extraction", "engine": "Gemini 2.5 Flash", "detail": "Mapped tabular headers to standard accounting schema"},
                {"time": "09:20:04", "stage": "Stage 4: Validation Engine", "engine": "Deterministic Rule Engine", "detail": "All 4 validation checks passed successfully"},
                {"time": "09:20:04", "stage": "Stage 5: SQLite Storage", "engine": "DocStore", "detail": "Committed to repository"}
            ]
        },
        {
            "id": "doc-104",
            "filename": "October_Logistics_Expenses.csv",
            "format": "CSV",
            "subType": "CSV Data File",
            "sizeKb": 32,
            "engine": "Pandas CSV Parser",
            "ocrConfidence": 100.0,
            "stage": 5,
            "progress": 100,
            "status": "FLAGGED",
            "uploadTime": "2026-10-31 09:24:11",
            "semanticTags": ["logistics", "air freight", "swiftcargo", "transport", "missing field"],
            "extractedText": "invoice_no,vendor,issue_date,currency,item_desc,qty,unit_price,subtotal,tax,total\n,SwiftCargo Express,2026-10-28,USD,Air Freight Express Priority Dispatch,3,180.00,540.00,27.00,567.00",
            "data": {
                "docType": "Expense Log",
                "invoiceNo": "",
                "vendor": "SwiftCargo Express",
                "issueDate": "2026-10-28",
                "currency": "USD",
                "subtotal": 540.00,
                "tax": 27.00,
                "total": 567.00,
                "lineItems": [
                    {"description": "Air Freight Express Priority Dispatch", "qty": 3, "unitPrice": 180.00}
                ]
            },
            "history": [
                {"time": "09:24:11", "stage": "Stage 1: Document Ingestion", "engine": "Upload Gateway", "detail": "Received CSV File (32 KB)"},
                {"time": "09:24:12", "stage": "Stage 2: Structured Parse", "engine": "Pandas CSV", "detail": "Parsed CSV row stream into memory"},
                {"time": "09:24:13", "stage": "Stage 3: AI Extraction", "engine": "Gemini 2.5 Flash", "detail": "Standardized schema: Invoice # is empty string"},
                {"time": "09:24:14", "stage": "Stage 4: Validation Engine", "engine": "Deterministic Rule Engine", "detail": "FLAGGED: Missing required field (Invoice / Reference Number is blank)"}
            ]
        }
    ]

    for item in sample_docs:
        save_full_document(item, conn)

def save_full_document(doc_dict: Dict[str, Any], conn: sqlite3.Connection = None):
    """Saves or updates a complete document record across the SQLite tables."""
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True

    cursor = conn.cursor()
    doc_id = doc_dict["id"]

    # 1. Documents metadata
    cursor.execute("""
    INSERT OR REPLACE INTO documents 
    (id, filename, file_path, format, sub_type, size_kb, engine, ocr_confidence, stage, progress, status, upload_time, semantic_tags_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc_id,
        doc_dict.get("filename", "unknown"),
        doc_dict.get("file_path", ""),
        doc_dict.get("format", "PDF"),
        doc_dict.get("subType", "Document"),
        doc_dict.get("sizeKb", 0),
        doc_dict.get("engine", "OCR"),
        doc_dict.get("ocrConfidence", 95.0),
        doc_dict.get("stage", 1),
        doc_dict.get("progress", 0),
        doc_dict.get("status", "PROCESSING"),
        doc_dict.get("uploadTime", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        json.dumps(doc_dict.get("semanticTags", []))
    ))

    # 2. Extracted text
    cursor.execute("""
    INSERT OR REPLACE INTO extracted_text (doc_id, raw_text)
    VALUES (?, ?)
    """, (doc_id, doc_dict.get("extractedText", "")))

    # 3. Structured Results
    data = doc_dict.get("data", {})
    cursor.execute("""
    INSERT OR REPLACE INTO structured_results 
    (doc_id, doc_type, invoice_no, vendor, customer, issue_date, currency, subtotal, tax, total, line_items_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc_id,
        data.get("docType", "Invoice"),
        data.get("invoiceNo", ""),
        data.get("vendor", ""),
        data.get("customer", ""),
        data.get("issueDate", ""),
        data.get("currency", "USD"),
        float(data.get("subtotal") or 0.0),
        float(data.get("tax") or 0.0),
        float(data.get("total") or 0.0),
        json.dumps(data.get("lineItems", []))
    ))

    # 4. Processing History
    cursor.execute("DELETE FROM processing_history WHERE doc_id = ?", (doc_id,))
    for h in doc_dict.get("history", []):
        cursor.execute("""
        INSERT INTO processing_history (doc_id, timestamp, stage, engine, detail)
        VALUES (?, ?, ?, ?, ?)
        """, (doc_id, h.get("time", ""), h.get("stage", ""), h.get("engine", ""), h.get("detail", "")))

    # 5. Validation Errors
    from app.pipeline.stage4_validator import evaluate_validation
    val_report = evaluate_validation(data, doc_id, conn)
    cursor.execute("DELETE FROM validation_errors WHERE doc_id = ?", (doc_id,))
    for chk in val_report.checks:
        cursor.execute("""
        INSERT INTO validation_errors (doc_id, check_id, check_title, passed, error_message)
        VALUES (?, ?, ?, ?, ?)
        """, (doc_id, chk.id, chk.title, 1 if chk.passed else 0, chk.message))

    # Update status according to validation
    final_status = "PROCESSING" if doc_dict.get("stage", 1) < 5 else val_report.status
    cursor.execute("UPDATE documents SET status = ? WHERE id = ?", (final_status, doc_id))

    conn.commit()
    if should_close:
        conn.close()

def fetch_document_by_id(doc_id: str) -> Optional[DocumentResponse]:
    """Fetches a single document by ID from SQLite."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    doc_row = cursor.fetchone()
    if not doc_row:
        conn.close()
        return None

    # Extracted text
    cursor.execute("SELECT raw_text FROM extracted_text WHERE doc_id = ?", (doc_id,))
    text_row = cursor.fetchone()
    extracted_text = text_row["raw_text"] if text_row else ""

    # Structured results
    cursor.execute("SELECT * FROM structured_results WHERE doc_id = ?", (doc_id,))
    data_row = cursor.fetchone()
    if data_row:
        line_items_data = json.loads(data_row["line_items_json"] or "[]")
        line_items = [LineItem(**it) for it in line_items_data]
        extracted_data = ExtractedData(
            docType=data_row["doc_type"] or "Invoice",
            invoiceNo=data_row["invoice_no"] or "",
            vendor=data_row["vendor"] or "",
            customer=data_row["customer"] if "customer" in data_row.keys() and data_row["customer"] else "",
            issueDate=data_row["issue_date"] or "",
            currency=data_row["currency"] or "USD",
            subtotal=data_row["subtotal"] or 0.0,
            tax=data_row["tax"] or 0.0,
            total=data_row["total"] or 0.0,
            lineItems=line_items
        )
    else:
        extracted_data = ExtractedData()

    # History
    cursor.execute("SELECT timestamp, stage, engine, detail FROM processing_history WHERE doc_id = ? ORDER BY id ASC", (doc_id,))
    history = [HistoryEntry(time=r["timestamp"], stage=r["stage"], engine=r["engine"], detail=r["detail"]) for r in cursor.fetchall()]

    # Validation
    cursor.execute("SELECT check_id, check_title, passed, error_message FROM validation_errors WHERE doc_id = ?", (doc_id,))
    val_rows = cursor.fetchall()
    checks = [ValidationCheck(id=r["check_id"], title=r["check_title"], passed=bool(r["passed"]), message=r["error_message"]) for r in val_rows]
    errors = [c.message for c in checks if not c.passed]
    val_passed = all(c.passed for c in checks) if checks else True
    validation = ValidationReport(
        passed=val_passed,
        status="VALID" if val_passed else "FLAGGED",
        errors=errors,
        checks=checks
    )

    tags = json.loads(doc_row["semantic_tags_json"] or "[]")

    doc_response = DocumentResponse(
        id=doc_row["id"],
        filename=doc_row["filename"],
        format=doc_row["format"],
        subType=doc_row["sub_type"] or "Document",
        sizeKb=doc_row["size_kb"] or 0,
        engine=doc_row["engine"] or "Engine",
        ocrConfidence=doc_row["ocr_confidence"] or 0.0,
        stage=doc_row["stage"] or 1,
        progress=doc_row["progress"] or 0,
        status=doc_row["status"] or "PROCESSING",
        uploadTime=doc_row["upload_time"] or "",
        semanticTags=tags,
        extractedText=extracted_text,
        data=extracted_data,
        validation=validation,
        history=history
    )

    conn.close()
    return doc_response

def fetch_all_documents(
    format_filter: Optional[str] = None, 
    status_filter: Optional[str] = None
) -> List[DocumentResponse]:
    """Fetches all documents with optional filters."""
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT id FROM documents WHERE 1=1"
    params = []

    if format_filter and format_filter.upper() != "ALL":
        query += " AND format = ?"
        params.append(format_filter.upper())

    if status_filter and status_filter.upper() != "ALL":
        query += " AND status = ?"
        params.append(status_filter.upper())

    query += " ORDER BY upload_time DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    docs = []
    for r in rows:
        d = fetch_document_by_id(r["id"])
        if d:
            docs.append(d)
    return docs

def delete_document_by_id(doc_id: str) -> bool:
    """Deletes a document and its cascading records."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

