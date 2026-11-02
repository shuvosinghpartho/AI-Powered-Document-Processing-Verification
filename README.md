# AI-Powered Document Intelligence System
> Enterprise Document Processing, OCR Vision Extraction, AI-Driven Semantic Analysis, and Financial Cross-Verification Platform.

---

## 🚀 Live System URLs

| Service | Port | Live URL | Description |
| :--- | :---: | :--- | :--- |
| **Frontend Web Application** | `5173` | [http://localhost:5173/](http://localhost:5173/) | Modern React 18 SaaS Dashboard, Document Inspector & Cross-Verification |
| **Backend REST API** | `8000` | [http://localhost:8000/](http://localhost:8000/) | FastAPI Asynchronous Background Processing Engine |
| **Interactive API Documentation** | `8000` | [http://localhost:8000/docs](http://localhost:8000/docs) | OpenAPI / Swagger UI with live request sandbox |
| **Alternative API Specs** | `8000` | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc API Reference |

---

## 🏛️ System Architecture Alignment

```
[User / Client] ──► [React.js SaaS Dashboard] ◄──► [FastAPI REST Backend] ◄──► [SQLite DB (WAL Mode)]
                             │                                │
                             ▼                                ▼
                  [Multi-File Upload]            [Async Background Pipeline]
                             │                                │
    ┌────────────────────────┴────────────────────────────────┴────────────────────────┐
    ▼                                        ▼                                        ▼
1. Document Ingest               2. Text Extraction / OCR                 3. AI Information Extraction
- PDF (Digital & Scanned)        - PyMuPDF (Digital PDFs & Pixmaps)       - Gemini 3.5 Flash Lite
- Images (PNG, JPG, TIFF)        - EasyOCR (Scanned Images & Docs)        - 9-Field Canonical JSON
- Excel (XLSX, XLS)              - Pandas + OpenPyXL (Excel Sheets)       - Resilient Heuristic Fallback
- CSV (Delimited)                - Pandas (CSV Tables)
- Empty & Corrupted File Guard   - Contrast Enhancement (OpenCV CLAHE)
    │                                        │                                        │
    └────────────────────────────────────────┬────────────────────────────────────────┘
                                             ▼
                                  4. Deterministic Validation & Reconciliation
                                  - Rule 1: Missing Required Fields Check
                                  - Rule 2: Numeric Calculation Check (Lines == Subtotal, Subtotal + Tax == Total)
                                  - Rule 3: Duplicate Invoice Detection across historical repository
                                  - Rule 4: Data Consistency & Calendar Date Logic Check
                                  - Rule 5: File Integrity & Corruption Guard
                                  - Cross-Verification: PDF-PDF & PDF-Excel Multi-Doc Financial Reconciliation
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             [VALID: 100% Match]                        [FLAGGED FOR MANUAL REVIEW]
                       │                                           │
                       ▼                                           ▼
             5. Save & Semantic Search                   Human-in-the-Loop Review Queue
             - SQLite Persistent Storage                 - Side-by-side Visual Inspector
             - Keyword Search (LIKE query)               - Inline Value Correction
             - Semantic Vector Cosine Index              - One-Click Failed-Job Reprocessing
```

---

## 📋 Comprehensive Assignment Requirements Fulfillment

### Task 1 — Multi-Format Document Processing & Ingestion
- **Accepted Formats**: Digital PDF, Scanned PDF, JPG, PNG, TIFF, BMP, XLSX, XLS, and CSV.
- **Engines**:
  - `PyMuPDF (fitz)`: Fast direct text extraction for digital PDFs; pixmap rendering for scanned PDF pages.
  - `EasyOCR`: Deep learning optical character recognition for noisy scans and images, accelerated with OpenCV CLAHE preprocessing.
  - `Pandas & OpenPyXL`: Structured spreadsheet ingestion preserving multi-sheet workbooks.
- **Resilience**:
  - Multi-page handling: Large PDF handling up to ~1,000 pages with high-throughput page sampling.
  - Corrupted and 0-byte file detection: Blocks empty uploads and flags unreadable binaries without crashing workers.
  - Path traversal protection: Filename sanitization against malicious paths.

### Task 2 — AI Information Extraction
- **LLM Engine**: Google Gemini API (`gemini-3.5-flash-lite`).
- **Target Schema**: Extracts canonical structured JSON strictly matching:
  - `docType`: Document categorization (Invoice, Receipt, Spreadsheet, Utility Bill)
  - `invoiceNo`: Invoice or reference identifier
  - `vendor`: Vendor or service provider name
  - `customer`: Bill-to customer name
  - `issueDate`: Normalized ISO-8601 calendar date (`YYYY-MM-DD`)
  - `currency`: 3-letter currency code (USD, EUR, GBP, BDT, etc.)
  - `subtotal`: Subtotal before tax
  - `tax`: Tax or VAT amount
  - `total`: Final payable total amount
  - `lineItems`: List of `{ description, qty, unitPrice }` items
- **Zero Hallucination Policy**: Strict prompting avoids inventing values for missing or obscured fields.

### Task 3 — Data Validation & Cross-Verification
- **Deterministic 4-Rule Engine**:
  1. **Missing Fields Check**: Flags any missing mandatory attributes (`invoiceNo`, `vendor`, `issueDate`, `total`).
  2. **Numeric Calculation Check**: Verifies that `sum(qty * unitPrice) == subtotal` and `subtotal + tax == total`.
  3. **Duplicate Detection**: Flags records sharing the same invoice number and vendor against the database.
  4. **Data Consistency Check**: Enforces standard calendar dates and flags distant future or illogical dates.
- **Cross-Verification API (`GET /api/v1/cross-verify`)**:
  - Compares pairs of documents (e.g. PDF invoice against Excel purchase order or twin PDFs).
  - Evaluates matching vendor, reference identifier, currency, subtotal, and total amount.
  - Calculates automated reconciliation match score (0–100%) and highlights discrepancies.

### Task 4 — Backend REST API
- `POST /api/v1/upload`: Multi-file upload with background task queueing.
- `GET /api/v1/documents`: List documents with filters, sorting, and pagination.
- `GET /api/v1/documents/{id}`: Fetch detailed document metadata, extracted text, and validation checks.
- `GET /api/v1/status/{id}`: Live real-time processing progress polling (0%–100%).
- `PUT /api/v1/documents/{id}`: Human-in-the-loop manual correction with automatic re-validation.
- `POST /api/v1/reprocess/{id}`: Failed-job and re-extraction pipeline trigger.
- `GET /api/v1/search`: Keyword filtering and semantic vector search.
- `GET /api/v1/cross-verify`: Financial cross-document reconciliation.
- `POST /api/v1/test-invoices/ingest`: Batch ingestion of test directory files.

### Task 5 — Database & Search
- **Database**: SQLite3 configured with **WAL (Write-Ahead Logging)** mode for concurrent, thread-safe asynchronous operations.
- **Schema**:
  - `documents`: Metadata, processing stages, OCR confidence, file paths, and statuses.
  - `extracted_data`: Raw OCR text and parsed text stream.
  - `structured_results`: Structured fields (`invoice_no`, `vendor`, `customer`, `issue_date`, `currency`, `subtotal`, `tax`, `total`).
  - `line_items`: Individual parsed line items linked via foreign keys.
  - `validation_errors`: Rule-by-rule audit logs.
  - `audit_history`: Step-by-step processing history.
- **Search Capabilities**:
  - Keyword Search: SQL `LIKE` querying across filenames, vendors, invoice numbers, and line items.
  - Semantic Search: Vector similarity matching across conceptual tokens and domain entities.

### Task 6 — React Frontend UI
- Modern SaaS interface designed with React 18, Tailwind CSS, and Lucide Icons.
- **Executive Dashboard**: Key performance indicators, status gauges, engine breakdown, and interactive visual charts.
- **Document Repository**: Data table with live status badges, confidence meters, and search filters.
- **Flagged Review Queue**: Dedicated human-in-the-loop triage center.
- **Document Inspector**: Side-by-side view with raw text viewer, structured fields, live formula verification, manual edit form, and reprocess actions.
- **Cross-Verification Tab**: Interactive side-by-side comparison for PDF-PDF and PDF-Excel reconciliation.
- **Quick Test Presets & Batch Ingest**: One-click test invoice injection.

### Task 7 — Automated Testing & System Evaluation
- Comprehensive Pytest test suite covering OCR parsing, AI extraction, validation logic, API endpoints, error handling, and cross-verification.
- Automated evaluation script (`evaluate_system.py`) reporting extraction accuracy, average latency, and success rates.

---

## 📊 System Evaluation Benchmark

Ran evaluation on test dataset (`evaluate_system.py`):

```text
===========================================================================
   AI-POWERED DOCUMENT INTELLIGENCE SYSTEM — TASK 7 EVALUATION REPORT
===========================================================================

📊 EXECUTIVE PERFORMANCE METRICS:
  • Total Documents Processed:       33
  • Field-Level Extraction Accuracy: 94.9%
  • Average Processing Latency:      1.84 seconds / document
  • OCR Average Engine Confidence:   89.4%
  • Document Valid Rate:             39.4% (Clean documents auto-approved)
  • Human-in-the-Loop Review Rate:   57.6% (Strict mathematical discrepancy flagging)

📁 FORMAT BREAKDOWN:
  • Scanned Images (PNG, JPG, TIFF): EasyOCR + CLAHE Vision Engine
  • Digital PDFs:                    PyMuPDF Direct Text Parser (99.4% confidence)
  • Excel Spreadsheets (XLSX, XLS):  Pandas + OpenPyXL Parser (100.0% confidence)
  • CSV Delimited Streams:           Pandas Delimited Parser (100.0% confidence)
===========================================================================
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/AI_Documents_Inteligent.git
cd AI_Documents_Inteligent

# Activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI Server
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend --reload
```

### 2. Frontend Setup
```bash
# In project root:
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
# Run full Pytest test suite (17 tests)
PYTHONPATH=backend .venv/bin/pytest backend/tests/ -v

# Run system evaluation benchmark
PYTHONPATH=backend .venv/bin/python backend/tests/evaluate_system.py
```

---

## 🔒 Security & Reliability Architecture
- **Safe Filename Sanitization**: Protects against directory traversal attacks (`../`).
- **Zero-Byte File Rejection**: Returns HTTP 400 immediately when empty files are received.
- **Upload Size Limit**: 50MB file size ceiling prevents Denial-of-Service (DoS) abuse.
- **SQLite WAL Mode**: `PRAGMA journal_mode=WAL` with a 30s lock timeout prevents database concurrency locking during simultaneous reads and background writes.
- **Resilient Fallback Mode**: If external LLM API rate limits occur, the built-in deterministic regex extractor automatically extracts essential fields so the pipeline never halts.

---

## 🗄️ Database Schema & Entity Relationships

The system utilizes an ACID-compliant SQLite relational database optimized with Write-Ahead Logging (`WAL`):

### 1. `documents` (Master Document Registry)
- `id` (TEXT, PK): Unique document identifier (e.g., `doc-101`)
- `filename` (TEXT, NOT NULL): Sanitized original file name
- `file_path` (TEXT): Absolute path to stored binary on disk
- `format` (TEXT): High-level category (`PDF`, `IMAGE`, `EXCEL`, `CSV`)
- `sub_type` (TEXT): Specific engine format descriptor
- `size_kb` (INTEGER): File size in kilobytes
- `engine` (TEXT): Extraction/OCR engine that processed document
- `ocr_confidence` (REAL): Measured OCR confidence score (0.0 to 100.0)
- `stage` (INTEGER): Current pipeline progress stage (1 to 5)
- `progress` (INTEGER): Completion percentage (0 to 100)
- `status` (TEXT): Validation status (`VALID`, `FLAGGED`, `PROCESSING`)
- `upload_time` (TEXT): ISO timestamp
- `semantic_tags_json` (TEXT): JSON array of semantic concepts

### 2. `extracted_text` (Raw Text Ingested)
- `doc_id` (TEXT, PK, FK -> documents.id): Document reference
- `raw_text` (TEXT): Unstructured OCR stream or parsed text dump

### 3. `structured_results` (Extracted Financial Entities)
- `doc_id` (TEXT, PK, FK -> documents.id): Document reference
- `doc_type` (TEXT): Document classification (e.g. Invoice, Receipt)
- `invoice_no` (TEXT): Extracted reference/invoice identifier
- `vendor` (TEXT): Extracted supplier or company name
- `customer` (TEXT): Extracted bill-to recipient
- `issue_date` (TEXT): Extracted date in `YYYY-MM-DD`
- `currency` (TEXT): Currency symbol/code (USD, EUR, etc.)
- `subtotal` (REAL): Subtotal numeric value
- `tax` (REAL): Tax/VAT numeric value
- `total` (REAL): Grand total numeric value
- `line_items_json` (TEXT): Serialized array of `{ description, qty, unitPrice }`

### 4. `validation_errors` (Audit Logs)
- `id` (INTEGER, PK, AUTOINCREMENT)
- `doc_id` (TEXT, FK -> documents.id)
- `check_id` (TEXT): Unique rule key (`rule-missing`, `rule-numeric`, etc.)
- `check_title` (TEXT): Readable rule name
- `passed` (INTEGER): Boolean 1 (passed) or 0 (flagged)
- `error_message` (TEXT): Explicit reason for discrepancy

### 5. `processing_history` (Traceability & HITL Audit Trail)
- `id` (INTEGER, PK, AUTOINCREMENT)
- `doc_id` (TEXT, FK -> documents.id)
- `timestamp` (TEXT)
- `stage` (TEXT): Pipeline stage name
- `engine` (TEXT): Processing engine or "Human Operator"
- `detail` (TEXT): Descriptive execution action

---

## 🤖 AI Prompts & Development Disclosure

### 1. Canonical Information Extraction Prompt
```text
You are an expert financial document intelligence system.
Analyze the following document text and extract the structured invoice or receipt details.
Return ONLY valid raw JSON with NO markdown code blocks, backticks, or preamble:
{
  "docType": "Invoice" | "Receipt" | "Spreadsheet" | "Utility Bill",
  "invoiceNo": "Invoice or reference number, or empty string",
  "vendor": "Supplier or vendor name, or empty string",
  "customer": "Customer or bill-to recipient, or empty string",
  "issueDate": "YYYY-MM-DD format if date found, or empty string",
  "currency": "USD" | "EUR" | "GBP" | "BDT",
  "subtotal": 0.0,
  "tax": 0.0,
  "total": 0.0,
  "lineItems": [
    {
      "description": "Item description",
      "qty": 1,
      "unitPrice": 0.0
    }
  ]
}

STRICT INSTRUCTIONS:
- Do NOT invent or hallucinate missing values.
- Calculate exact numeric figures as floats.
- Ensure all lineItems have description, qty, and unitPrice.
```

### 2. AI-Assisted Development Disclosure
- **Assisted Tools**: Google Gemini Flash Lite for entity extraction; AI code assistance for rapid component scaffolding.
- **Human Curation**: All validation algorithms, SQLite schema migrations, EasyOCR fallbacks, and reconciliation formulas are deterministic, rigorously tested, and maintain 100% human-in-the-loop auditability.

