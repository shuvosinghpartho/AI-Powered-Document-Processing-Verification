export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-001',
    filename: 'INV-2026-0891_Digital.pdf',
    format: 'PDF',
    subType: 'Digital Native PDF',
    sizeKb: 248,
    engine: 'PyMuPDF Direct Text Parser',
    ocrConfidence: 99.4,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-11-03 09:15:02',
    semanticTags: ['cloud infrastructure', 'gpu inference', 'managed postgresql', 'nimbus cloud', 'digital pdf'],
    extractedText: `INVOICE #INV-2026-0891\nVendor: Nimbus Cloud Systems Ltd.\nTax ID: US-EIN-88219401\nDate: 2026-10-18\nCurrency: USD\nDue Date: 2026-11-18\n\nLine Items:\n1. Dedicated GPU Inference Node (H100 SXM5) - Qty: 2 @ $600.00 = $1,200.00\n2. Managed PostgreSQL & pgvector Cluster - Qty: 1 @ $300.00 = $300.00\n\nFinancial Summary:\nSubtotal: $1,500.00\nTax (Sales 10.0%): $150.00\nTotal Due: $1,650.00\nStatus: UNPAID (Net 30)`,
    data: {
      isFinancialDocument: true,
      docType: 'Invoice',
      invoiceNo: 'INV-2026-0891',
      vendor: 'Nimbus Cloud Systems Ltd.',
      customer: 'Global Technology Partners',
      issueDate: '2026-10-18',
      currency: 'USD',
      subtotal: 1500.00,
      tax: 150.00,
      total: 1650.00,
      lineItems: [
        { description: 'Dedicated GPU Inference Node (H100 SXM5)', qty: 2.0, unitPrice: 600.00 },
        { description: 'Managed PostgreSQL & pgvector Cluster', qty: 1.0, unitPrice: 300.00 }
      ],
      notes: '100% digital text extracted with high confidence'
    },
    history: [
      { time: '09:15:02', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received Digital PDF (248 KB, MD5 verified)' },
      { time: '09:15:03', stage: 'Stage 2: Text Extraction', engine: 'PyMuPDF Engine', detail: 'Extracted digital text stream (Confidence: 99.4%)' },
      { time: '09:15:04', stage: 'Stage 3: AI Extraction', engine: 'Gemini 3.5 Flash Lite', detail: 'Structured entities & 2 line items parsed via Schema' },
      { time: '09:15:05', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'Status: VALID (All 5 rules passed)' },
      { time: '09:15:05', stage: 'Stage 5: SQLite & Vector Store', engine: 'DocStore & Embeddings', detail: 'Committed record and generated semantic tags' }
    ]
  },
  {
    id: 'doc-002',
    filename: 'invoice_1000_pages.pdf',
    format: 'PDF',
    subType: 'Multi-Page PDF (1000 Pages)',
    sizeKb: 1868,
    engine: 'PyMuPDF Direct Text Parser',
    ocrConfidence: 99.4,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-11-03 09:20:11',
    semanticTags: ['massive multi-page', 'enterprise logistics', '1000-page document', 'fast stream'],
    extractedText: `INVOICE #INV-2026-0001\nVendor: Enterprise Solutions Inc.\nDate: November 3, 2026\nBilling To: Global Logistics Corp\nPage: 1 of 1000\nItem Description | Qty | Unit Price | Total\nEnterprise Service Deployment Line Item Asset #1 | 2 | $150.00 | $300.00\nEnterprise Service Deployment Line Item Asset #2 | 2 | $150.00 | $300.00\nPage Subtotal: $6000.00\nTotal Due: $6000.00\nTerms: Net 30`,
    data: {
      isFinancialDocument: true,
      docType: 'Invoice',
      invoiceNo: 'INV-2026-0001',
      vendor: 'Enterprise Solutions Inc.',
      customer: 'Global Logistics Corp',
      issueDate: '2026-11-03',
      currency: 'USD',
      subtotal: 6000.00,
      tax: 0.00,
      total: 6000.00,
      lineItems: [
        { description: 'Enterprise Service Deployment Line Item Asset #1', qty: 2.0, unitPrice: 150.00 },
        { description: 'Enterprise Service Deployment Line Item Asset #2', qty: 2.0, unitPrice: 150.00 }
      ],
      notes: 'Parsed primary accounting ledger from 1000-page document stream in 3.8s'
    },
    history: [
      { time: '09:20:11', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Registered file invoice_1000_pages.pdf (1,868 KB, 1,000 pages)' },
      { time: '09:20:12', stage: 'Stage 2: Text Extraction', engine: 'PyMuPDF Direct Text Parser', detail: 'Extracted high-density text stream (Confidence: 99.4%)' },
      { time: '09:20:14', stage: 'Stage 3: AI Extraction', engine: 'Gemini 3.5 Flash Lite', detail: 'Parsed line items and natural language date (November 3, 2026)' },
      { time: '09:20:15', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'Status: VALID (0 issue(s))' },
      { time: '09:20:15', stage: 'Stage 5: SQLite & Vector Store', engine: 'DocStore & Embeddings', detail: 'Committed to repository and generated semantic concept tags' }
    ]
  },
  {
    id: 'doc-003',
    filename: 'invoice.png',
    format: 'IMAGE',
    subType: 'Scanned PNG Image',
    sizeKb: 24,
    engine: 'EasyOCR Vision Engine',
    ocrConfidence: 84.3,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-11-03 09:22:15',
    semanticTags: ['automotive repair', 'east repair', 'brake cable', 'labor', 'vision ocr'],
    extractedText: `INVOICE\nEast Repair Inc.\n1912 Harvest Lane, New York, NY 12210\nBILL TO: John Smith, 2 Court Square, Cambridge, MA 12210\nINVOICE #: US-001\nINVOICE DATE: 11/02/2019\nPO.#: 2312/2019\nDUE DATE: 26/02/2019\n\nQTY | DESCRIPTION | UNIT PRICE | AMOUNT\n1 | Front and rear brake cables | $100.00 | $100.00\n1 | New set of pedal arms | $15.00 | $15.00\n1 | Labor 3hrs | $10.00 | $30.00\n\nSubtotal: $145.00\nSales Tax 6.25%: $9.06\nTOTAL: $154.06`,
    data: {
      isFinancialDocument: true,
      docType: 'Invoice',
      invoiceNo: 'US-001',
      vendor: 'East Repair Inc.',
      customer: 'John Smith',
      issueDate: '2019-02-11',
      currency: 'USD',
      subtotal: 145.00,
      tax: 9.06,
      total: 154.06,
      lineItems: [
        { description: 'Front and rear brake cables', qty: 1.0, unitPrice: 100.00 },
        { description: 'New set of pedal arms', qty: 1.0, unitPrice: 15.00 },
        { description: 'Labor 3hrs', qty: 3.0, unitPrice: 10.00 }
      ],
      notes: 'Verified through EasyOCR vision pipeline and multimodal AI'
    },
    history: [
      { time: '09:22:15', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received PNG Image (24 KB)' },
      { time: '09:22:16', stage: 'Stage 2: OCR Extraction', engine: 'EasyOCR Vision Pipeline', detail: 'Extracted visual text stream (Confidence: 84.3%)' },
      { time: '09:22:18', stage: 'Stage 3: AI Extraction', engine: 'Gemini 3.5 Flash Lite', detail: 'Mapped invoice coordinates, tax, and line items' },
      { time: '09:22:19', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'Status: VALID (All 5 rules passed)' },
      { time: '09:22:19', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Committed to repository' }
    ]
  },
  {
    id: 'doc-004',
    filename: 'invoice-2.png',
    format: 'IMAGE',
    subType: 'Scanned PNG Image',
    sizeKb: 45,
    engine: 'EasyOCR Vision Engine',
    ocrConfidence: 79.5,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-11-03 09:24:30',
    semanticTags: ['service invoice', 'consulting labor', 'replacement parts', 'vision ocr'],
    extractedText: `Company Name\nINVOICE\nDATE: 12/9/2019\nINVOICE: [123456]\nCUSTOMER ID: [123]\nDUE DATE: 1/8/2020\n\nDESCRIPTION | AMOUNT\n[Service Fee] | $230.00\n[Labor: 5 hours at $75/hr] | $375.00\n[Parts] | $345.00\n\nSubtotal: $950.00\nTax: $21.56\nTOTAL: $971.56`,
    data: {
      isFinancialDocument: true,
      docType: 'Invoice',
      invoiceNo: '[123456]',
      vendor: 'Company Name',
      customer: 'Client Account #123',
      issueDate: '2019-12-09',
      currency: 'USD',
      subtotal: 950.00,
      tax: 21.56,
      total: 971.56,
      lineItems: [
        { description: '[Service Fee]', qty: 1.0, unitPrice: 230.00 },
        { description: '[Labor: 5 hours at $75/hr]', qty: 5.0, unitPrice: 75.00 },
        { description: '[Parts]', qty: 1.0, unitPrice: 345.00 }
      ],
      notes: 'Normalized flat-fee line item quantities, math balanced cleanly ($950 + $21.56 = $971.56)'
    },
    history: [
      { time: '09:24:30', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received PNG Image (45 KB)' },
      { time: '09:24:31', stage: 'Stage 2: OCR Extraction', engine: 'EasyOCR Vision Pipeline', detail: 'Extracted visual text stream (Confidence: 79.5%)' },
      { time: '09:24:33', stage: 'Stage 3: AI Extraction', engine: 'Gemini 3.5 Flash Lite', detail: 'Normalized line item quantities and extracted ledger' },
      { time: '09:24:34', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'Status: VALID (Math balanced)' },
      { time: '09:24:34', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Committed to repository' }
    ]
  },
  {
    id: 'doc-005',
    filename: 'Scan_Receipt_ApexHardware.png',
    format: 'IMAGE',
    subType: 'Scanned Receipt Image',
    sizeKb: 1420,
    engine: 'EasyOCR Vision Pipeline',
    ocrConfidence: 87.2,
    stage: 5,
    progress: 100,
    status: 'FLAGGED',
    uploadTime: '2026-11-03 09:26:40',
    semanticTags: ['hardware procurement', '4k monitor', 'desk mount', 'display', 'math discrepancy'],
    extractedText: `[EasyOCR Scan Output - Confidence 87.2%]\nAPEX OFFICE HARDWARE & DISPLAYS\nTax ID: 94-2018442\nReceipt / Tax Invoice No: APX-99412\nDate: 2026-10-22\n\nItems Charged:\n- 4K UltraSharp 27" USB-C Monitor | Qty: 2 @ $420.00 = $840.00\n- Ergonomic Heavy-Duty Desk Mount Arm | Qty: 2 @ $80.00 = $160.00\n\nSubtotal: $1,000.00\nVAT (15%): $150.00\nTOTAL AMOUNT CHARGED: $1,210.00  <-- [OCR smudge misread: $1,150.00 as $1,210.00]`,
    data: {
      isFinancialDocument: true,
      docType: 'Receipt',
      invoiceNo: 'APX-99412',
      vendor: 'Apex Office Hardware & Displays',
      customer: 'Procurement Dept',
      issueDate: '2026-10-22',
      currency: 'USD',
      subtotal: 1000.00,
      tax: 150.00,
      total: 1210.00,
      lineItems: [
        { description: '4K UltraSharp 27" USB-C Monitor', qty: 2.0, unitPrice: 420.00 },
        { description: 'Ergonomic Heavy-Duty Desk Mount Arm', qty: 2.0, unitPrice: 80.00 }
      ],
      notes: 'Flagged by Rule 2: Subtotal ($1,000.00) + Tax ($150.00) != Total ($1,210.00)'
    },
    history: [
      { time: '09:26:40', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received PNG Image (1,420 KB)' },
      { time: '09:26:42', stage: 'Stage 2: OCR Extraction', engine: 'EasyOCR Model', detail: 'Extracted text via optical character recognition (Confidence: 87.2%)' },
      { time: '09:26:44', stage: 'Stage 3: AI Extraction', engine: 'Gemini 3.5 Flash Lite', detail: 'Extracted JSON schema with detected numbers' },
      { time: '09:26:45', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'FLAGGED: Numeric Calculation Mismatch ($1,000.00 + $150.00 != $1,210.00)' },
      { time: '09:26:45', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Stored in human review queue for inline entity correction' }
    ]
  },
  {
    id: 'doc-006',
    filename: 'Q4_Procurement_Order.xlsx',
    format: 'EXCEL',
    subType: 'Excel Spreadsheet (.xlsx)',
    sizeKb: 84,
    engine: 'Pandas + OpenPyXL Parser',
    ocrConfidence: 100.0,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-11-03 09:28:01',
    semanticTags: ['software licenses', 'analytics', 'dataforge', 'enterprise bi', 'procurement', 'excel'],
    extractedText: `[Pandas Tabular Dump - Sheet: PO_Summary]\nPurchase Order Number: PO-2026-4410\nVendor Entity: DataForge Analytics Inc.\nEffective Date: 2026-10-25\nCurrency: USD\n\nLine Item Rows:\nRow 1: Enterprise BI Seat License | Qty: 10 | Unit: $95.00 | LineTotal: $950.00\nRow 2: Automated Connector Addon | Qty: 1 | Unit: $250.00 | LineTotal: $250.00\n\nSubtotal: $1,200.00\nTax (5%): $60.00\nTotal Order Value: $1,260.00`,
    data: {
      isFinancialDocument: true,
      docType: 'Purchase Order',
      invoiceNo: 'PO-2026-4410',
      vendor: 'DataForge Analytics Inc.',
      customer: 'Enterprise Operations Corp',
      issueDate: '2026-10-25',
      currency: 'USD',
      subtotal: 1200.00,
      tax: 60.00,
      total: 1260.00,
      lineItems: [
        { description: 'Enterprise BI Seat License', qty: 10.0, unitPrice: 95.00 },
        { description: 'Automated Connector Addon', qty: 1.0, unitPrice: 250.00 }
      ],
      notes: 'Parsed multi-cell dataframes without OCR noise (100% precision)'
    },
    history: [
      { time: '09:28:01', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received Excel Workbook (.xlsx, 84 KB)' },
      { time: '09:28:02', stage: 'Stage 2: Tabular Extraction', engine: 'Pandas + OpenPyXL', detail: 'Parsed multi-cell dataframes without OCR noise (100% precision)' },
      { time: '09:28:03', stage: 'Stage 3: AI Extraction', engine: 'Gemini 3.5 Flash Lite', detail: 'Mapped tabular headers to standard accounting schema' },
      { time: '09:28:04', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'Status: VALID (All 5 validation checks passed successfully)' },
      { time: '09:28:04', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Committed to repository' }
    ]
  },
  {
    id: 'doc-007',
    filename: 'SwiftNetwork_Expenses.csv',
    format: 'CSV',
    subType: 'Delimited CSV Stream',
    sizeKb: 18,
    engine: 'Pandas CSV Parser',
    ocrConfidence: 100.0,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-11-03 09:30:15',
    semanticTags: ['logistics expenses', 'cloud transit', 'fast tabular parser', 'csv'],
    extractedText: `invoice_no,vendor,issue_date,currency,item_desc,qty,unit_price,subtotal,tax,total\nCSV-2026-550,SwiftNetwork Express,2026-10-31,USD,High-Speed Enterprise Cloud Transit Bandwidth,2,450.00,900.00,90.00,990.00`,
    data: {
      isFinancialDocument: true,
      docType: 'Expense Log',
      invoiceNo: 'CSV-2026-550',
      vendor: 'SwiftNetwork Express',
      customer: 'Global Cloud Logistics',
      issueDate: '2026-10-31',
      currency: 'USD',
      subtotal: 900.00,
      tax: 90.00,
      total: 990.00,
      lineItems: [
        { description: 'High-Speed Enterprise Cloud Transit Bandwidth', qty: 2.0, unitPrice: 450.00 }
      ],
      notes: 'Fast-track tabular extraction executed in < 8ms'
    },
    history: [
      { time: '09:30:15', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received CSV Stream (18 KB)' },
      { time: '09:30:15', stage: 'Stage 2: Tabular Extraction', engine: 'Pandas CSV', detail: 'Parsed CSV data rows (Confidence: 100.0%)' },
      { time: '09:30:15', stage: 'Stage 3: AI Extraction', engine: 'Deterministic Tabular Extractor', detail: 'Mapped CSV columns to accounting schema in 6ms' },
      { time: '09:30:16', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'Status: VALID (All 5 rules passed)' },
      { time: '09:30:16', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Committed to repository' }
    ]
  },
  {
    id: 'doc-008',
    filename: 'October_Logistics_Expenses.csv',
    format: 'CSV',
    subType: 'Delimited CSV Stream',
    sizeKb: 32,
    engine: 'Pandas CSV Parser',
    ocrConfidence: 100.0,
    stage: 5,
    progress: 100,
    status: 'FLAGGED',
    uploadTime: '2026-11-03 09:32:00',
    semanticTags: ['logistics', 'air freight', 'swiftcargo', 'transport', 'missing field'],
    extractedText: `invoice_no,vendor,issue_date,currency,item_desc,qty,unit_price,subtotal,tax,total\n,SwiftCargo Express,2026-10-28,USD,Air Freight Express Priority Dispatch,3,180.00,540.00,27.00,567.00`,
    data: {
      isFinancialDocument: true,
      docType: 'Expense Log',
      invoiceNo: '',
      vendor: 'SwiftCargo Express',
      customer: 'Supply Chain Logistics',
      issueDate: '2026-10-28',
      currency: 'USD',
      subtotal: 540.00,
      tax: 27.00,
      total: 567.00,
      lineItems: [
        { description: 'Air Freight Express Priority Dispatch', qty: 3.0, unitPrice: 180.00 }
      ],
      notes: 'Flagged by Rule 1: Missing Required Field (Invoice / Reference Number is blank)'
    },
    history: [
      { time: '09:32:00', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received CSV File (32 KB)' },
      { time: '09:32:00', stage: 'Stage 2: Structured Parse', engine: 'Pandas CSV', detail: 'Parsed CSV row stream into memory' },
      { time: '09:32:01', stage: 'Stage 3: AI Extraction', engine: 'Deterministic Tabular Extractor', detail: 'Standardized schema: Invoice # is empty string' },
      { time: '09:32:01', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'FLAGGED: Missing required field (Invoice / Reference Number is blank)' },
      { time: '09:32:02', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Enqueued into human audit correction queue' }
    ]
  },
  {
    id: 'doc-009',
    filename: 'Research_Study_AutoML.pdf',
    format: 'PDF',
    subType: 'Academic Research Paper',
    sizeKb: 850,
    engine: 'PyMuPDF Direct Text Parser',
    ocrConfidence: 99.1,
    stage: 5,
    progress: 100,
    status: 'FLAGGED',
    uploadTime: '2026-11-03 09:34:20',
    semanticTags: ['academic paper', 'machine learning', 'automl', 'non-financial', 'authenticity guard'],
    extractedText: `An Empirical Study of a No-Code AutoML Framework through Designing and Analyzing an Insulin-Dosage Prediction Model Applicable for the Patients with Type-1 Diabetes\nAuthors: Department of Computer Science and Engineering\nAbstract: Automated Machine Learning (AutoML) democratizes AI by automating pipelines.`,
    data: {
      isFinancialDocument: false,
      docType: 'Non-Financial Document',
      invoiceNo: '',
      vendor: '',
      customer: '',
      issueDate: '',
      currency: 'USD',
      subtotal: 0.00,
      tax: 0.00,
      total: 0.00,
      lineItems: [],
      notes: 'Document Authenticity Check: Rejected - Academic research paper does not represent commercial billing transactions.'
    },
    history: [
      { time: '09:34:20', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Registered PDF file (850 KB)' },
      { time: '09:34:21', stage: 'Stage 2: Text Extraction', engine: 'PyMuPDF Engine', detail: 'Extracted academic text stream (Confidence: 99.1%)' },
      { time: '09:34:22', stage: 'Stage 3: AI Extraction', engine: 'Gemini 3.5 Flash Lite', detail: 'Classified document as non-financial academic publication' },
      { time: '09:34:23', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'FLAGGED: Rule 0 Authenticity Failure (Not a commercial invoice or receipt)' },
      { time: '09:34:23', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Flagged in audit quarantine' }
    ]
  },
  {
    id: 'doc-010',
    filename: 'Corrupted_Archive_Stream.pdf',
    format: 'PDF',
    subType: 'Corrupted File',
    sizeKb: 12,
    engine: 'PyMuPDF File Integrity Guard',
    ocrConfidence: 0.0,
    stage: 5,
    progress: 100,
    status: 'FLAGGED',
    uploadTime: '2026-11-03 09:36:10',
    semanticTags: ['corrupted file', 'zero-byte guard', 'file integrity check', 'damaged stream'],
    extractedText: '[CORRUPTED_FILE: PDF header signature missing or invalid trailer xref table]',
    data: {
      isFinancialDocument: false,
      docType: 'Corrupted File',
      invoiceNo: '',
      vendor: '',
      customer: '',
      issueDate: '',
      currency: 'USD',
      subtotal: 0.00,
      tax: 0.00,
      total: 0.00,
      lineItems: [],
      notes: 'File Integrity Guard: Corrupted binary file structure detected at Stage 1/2.'
    },
    history: [
      { time: '09:36:10', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received binary stream (12 KB)' },
      { time: '09:36:10', stage: 'Stage 2: Text Extraction', engine: 'PyMuPDF Engine', detail: 'Detected corrupted binary header - file integrity violation' },
      { time: '09:36:11', stage: 'Stage 3: AI Extraction', engine: 'System Error Handler', detail: 'Halted AI extraction on corrupted payload' },
      { time: '09:36:11', stage: 'Stage 4: Validation Engine', engine: 'Deterministic 5-Rule Engine', detail: 'FLAGGED: Rule 0 File Integrity Check Failed' },
      { time: '09:36:12', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Quarantined in validation exception registry' }
    ]
  }
];

// Historical Trend Data for SaaS Charts
export const WEEKLY_PROCESSING_STATS = [
  { day: 'Mon', count: 42, passed: 39, flagged: 3, spend: 14200 },
  { day: 'Tue', count: 58, passed: 52, flagged: 6, spend: 21800 },
  { day: 'Wed', count: 65, passed: 61, flagged: 4, spend: 28400 },
  { day: 'Thu', count: 80, passed: 74, flagged: 6, spend: 34100 },
  { day: 'Fri', count: 95, passed: 88, flagged: 7, spend: 41900 },
  { day: 'Sat', count: 34, passed: 32, flagged: 2, spend: 12500 },
  { day: 'Sun', count: 28, passed: 27, flagged: 1, spend: 9800 },
];

export const FORMAT_DISTRIBUTION = [
  { label: 'PDF Documents', value: 52, color: '#6366f1' },
  { label: 'Vision Images (PNG/JPG)', value: 24, color: '#38bdf8' },
  { label: 'Excel Spreadsheets', value: 14, color: '#10b981' },
  { label: 'CSV Data Files', value: 10, color: '#f59e0b' },
];

const GENERIC_PLACEHOLDERS = new Set([
  'inv-001', '123', '123456', '[123456]', 'xxxxx', 'xxx', 'temp', 'n/a', 'unknown', 'none', '0', '000'
]);

// Deterministic Autonomous Validation Engine
export function runValidationRules(doc, allDocs = []) {
  const d = doc.data || {};
  const errors = [];
  const checks = [];

  // 0. Document Authenticity Check
  const isFinancial = d.isFinancialDocument !== false;
  const docType = String(d.docType || 'Invoice').trim();
  const isNonFinancial = !isFinancial || ['Non-Financial Document', 'Unrelated Image', 'Academic Paper', 'Corrupted File'].includes(docType);

  if (isNonFinancial) {
    checks.push({
      id: 'rule-authenticity',
      title: 'Document Authenticity Check',
      passed: false,
      message: `Rejected: Document is not a recognized commercial invoice or receipt (${docType})`
    });
    errors.push(`Document Authenticity Check: Rejected - Not a financial invoice (${docType})`);
  } else {
    checks.push({
      id: 'rule-authenticity',
      title: 'Document Authenticity Check',
      passed: true,
      message: `Authentic financial document verified (${docType})`
    });
  }

  // 1. Missing Fields Check
  const missing = [];
  if (!d.invoiceNo || !d.invoiceNo.trim()) missing.push('Invoice / Ref #');
  if (!d.vendor || !d.vendor.trim()) missing.push('Vendor Name');
  if (!d.issueDate || !d.issueDate.trim()) missing.push('Issue Date');
  const numTotal = Number(d.total);
  if (d.total === null || d.total === undefined || isNaN(numTotal) || numTotal <= 0) {
    missing.push('Valid Total Amount (> $0.00)');
  }

  const rule1Passed = missing.length === 0;
  if (!rule1Passed) {
    errors.push(`Missing Required Fields: ${missing.join(', ')}`);
  }
  checks.push({
    id: 'rule-missing',
    title: 'Missing Fields Check',
    passed: rule1Passed,
    message: rule1Passed ? 'All mandatory fields present' : `Missing: ${missing.join(', ')}`
  });

  // 2. Numeric Calculation Check
  const lineSum = (d.lineItems || []).reduce((acc, item) => {
    return acc + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
  }, 0);
  const subtotal = Number(d.subtotal) || 0;
  const tax = Number(d.tax) || 0;
  const total = Number(d.total) || 0;

  let rule2Passed = false;
  let rule2Message = '';

  if (isNonFinancial || total <= 0) {
    rule2Passed = false;
    rule2Message = 'No positive financial amounts recorded to calculate';
    errors.push('Numeric Sanity: No valid monetary values found');
  } else {
    const hasLineItems = (d.lineItems || []).length > 0;
    const linesMatchSubtotal = !hasLineItems || Math.abs(lineSum - subtotal) < 0.05;
    const subtotalPlusTaxMatchesTotal = Math.abs((subtotal + tax) - total) < 0.05;
    rule2Passed = linesMatchSubtotal && subtotalPlusTaxMatchesTotal;

    rule2Message = `Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) = Total ($${total.toFixed(2)})`;
    if (!linesMatchSubtotal) {
      const diff = (lineSum - subtotal).toFixed(2);
      rule2Message = `Line items sum ($${lineSum.toFixed(2)}) ≠ Subtotal ($${subtotal.toFixed(2)}) [Diff: $${diff}]`;
      errors.push(rule2Message);
    } else if (!subtotalPlusTaxMatchesTotal) {
      const expected = (subtotal + tax).toFixed(2);
      rule2Message = `Math Mismatch: Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) = $${expected}, but recorded Total is $${total.toFixed(2)}`;
      errors.push(rule2Message);
    }
  }

  checks.push({
    id: 'rule-numeric',
    title: 'Numeric Calculation Check',
    passed: rule2Passed,
    message: rule2Message
  });

  // 3. Duplicate Check
  let rule3Passed = true;
  let rule3Message = 'No duplicate detected in repository';
  const cleanInv = (d.invoiceNo || '').trim().toLowerCase();
  const isPlaceholder = GENERIC_PLACEHOLDERS.has(cleanInv) || cleanInv.length < 3;

  if (cleanInv && !isPlaceholder && d.vendor && total > 0 && allDocs.length > 0) {
    const dupe = allDocs.find(other => 
      other.id !== doc.id &&
      other.filename !== doc.filename && 
      other.data && 
      other.data.invoiceNo && 
      other.data.invoiceNo.trim().toLowerCase() === cleanInv &&
      other.data.vendor && 
      other.data.vendor.trim().toLowerCase() === (d.vendor || '').trim().toLowerCase() &&
      (Math.abs((Number(other.data.total) || 0) - total) < 0.05 || (Number(other.data.total) || 0) === 0)
    );
    if (dupe) {
      rule3Passed = false;
      rule3Message = `Duplicate invoice #${d.invoiceNo} already exists in ${dupe.filename}`;
      errors.push(rule3Message);
    }
  }
  checks.push({
    id: 'rule-duplicate',
    title: 'Duplicate Detection Check',
    passed: rule3Passed,
    message: rule3Message
  });

  // 4. Date Logic Check
  let rule4Passed = false;
  let rule4Message = 'Invalid date format';
  if (d.issueDate && typeof d.issueDate === 'string') {
    const parsedDate = new Date(d.issueDate);
    if (!isNaN(parsedDate.getTime())) {
      const now = new Date();
      const maxFuture = new Date();
      maxFuture.setDate(now.getDate() + 45);
      if (parsedDate > maxFuture) {
        rule4Passed = false;
        rule4Message = `Issue date (${d.issueDate}) is abnormally far in the future`;
        errors.push(rule4Message);
      } else {
        rule4Passed = true;
        rule4Message = `Valid calendar date (${d.issueDate})`;
      }
    }
  } else {
    rule4Message = 'No issue date provided';
  }
  checks.push({
    id: 'rule-date',
    title: 'Date Logic Check',
    passed: rule4Passed,
    message: rule4Message
  });

  const overallPassed = checks.every(c => c.passed);
  return {
    passed: overallPassed,
    status: overallPassed ? 'VALID' : 'FLAGGED',
    errors,
    checks
  };
}

