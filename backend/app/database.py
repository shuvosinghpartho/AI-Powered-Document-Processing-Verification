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

def init_db(force_seed: bool = False):
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

    # Indices for high speed search and duplicate lookups
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_docs_status ON documents(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_struct_inv_vendor ON structured_results(invoice_no, vendor)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_docs_filename ON documents(filename)")

    conn.commit()

    # Seed with initial records if empty or forced
    cursor.execute("SELECT COUNT(*) as cnt FROM documents")
    count = cursor.fetchone()["cnt"]
    if count == 0 or force_seed:
        seed_initial_data(conn)

    conn.close()

def seed_initial_data(conn: sqlite3.Connection):
    """Seeds the SQLite database with rich initial multi-format documents."""
    from app.seed_data import SEED_DOCUMENTS

    for item in SEED_DOCUMENTS:
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
    val_report = evaluate_validation(data, doc_id, conn, raw_text=doc_dict.get("extractedText", ""))
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

