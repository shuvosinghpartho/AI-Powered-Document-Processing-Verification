export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-101',
    filename: 'INV-2026-0891_Digital.pdf',
    format: 'PDF',
    subType: 'Digital Native PDF',
    sizeKb: 248,
    engine: 'PyMuPDF Direct Text Parser',
    ocrConfidence: 99.4,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-10-31 09:15:02',
    semanticTags: ['cloud infrastructure', 'gpu inference', 'managed postgresql', 'nimbus cloud', 'aws'],
    extractedText: `INVOICE #INV-2026-0891\nVendor: Nimbus Cloud Systems Ltd.\nTax ID: US-EIN-88219401\nDate: 2026-10-18\nCurrency: USD\nDue Date: 2026-11-18\n\nLine Items:\n1. Dedicated GPU Inference Node (H100 SXM5) - Qty: 2 @ $600.00 = $1,200.00\n2. Managed PostgreSQL & pgvector Cluster - Qty: 1 @ $300.00 = $300.00\n\nFinancial Summary:\nSubtotal: $1,500.00\nTax (Sales 10.0%): $150.00\nTotal Due: $1,650.00\nStatus: UNPAID (Net 30)`,
    data: {
      docType: 'Invoice',
      invoiceNo: 'INV-2026-0891',
      vendor: 'Nimbus Cloud Systems Ltd.',
      issueDate: '2026-10-18',
      currency: 'USD',
      subtotal: 1500.00,
      tax: 150.00,
      total: 1650.00,
      lineItems: [
        { description: 'Dedicated GPU Inference Node (H100 SXM5)', qty: 2, unitPrice: 600.00 },
        { description: 'Managed PostgreSQL & pgvector Cluster', qty: 1, unitPrice: 300.00 }
      ]
    },
    history: [
      { time: '09:15:02', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received Digital PDF (248 KB, MD5 verified)' },
      { time: '09:15:03', stage: 'Stage 2: Text Extraction', engine: 'PyMuPDF Engine', detail: 'Extracted digital text stream (Confidence: 99.4%)' },
      { time: '09:15:05', stage: 'Stage 3: AI Extraction', engine: 'Gemini 2.5 Flash', detail: 'Structured entities & 2 line items parsed via Schema' },
      { time: '09:15:06', stage: 'Stage 4: Validation Engine', engine: 'Deterministic Rule Engine', detail: 'All 4 validation checks passed successfully' },
      { time: '09:15:06', stage: 'Stage 5: SQLite & Vector Store', engine: 'DocStore & Embeddings', detail: 'Indexed in SQLite and stored 768d text embeddings' }
    ]
  },
  {
    id: 'doc-102',
    filename: 'Scan_Receipt_ApexHardware.png',
    format: 'IMAGE',
    subType: 'Scanned Receipt Image',
    sizeKb: 1420,
    engine: 'EasyOCR Vision Pipeline',
    ocrConfidence: 87.2,
    stage: 5,
    progress: 100,
    status: 'FLAGGED',
    uploadTime: '2026-10-31 09:18:14',
    semanticTags: ['hardware procurement', '4k monitor', 'desk mount', 'display', 'math discrepancy'],
    extractedText: `[EasyOCR Scan Output - Confidence 87.2%]\nAPEX OFFICE HARDWARE & DISPLAYS\nTax ID: 94-2018442\nReceipt / Tax Invoice No: APX-99412\nDate: 2026-10-22\n\nItems Charged:\n- 4K UltraSharp 27" USB-C Monitor | Qty: 2 @ $420.00 = $840.00\n- Ergonomic Heavy-Duty Desk Mount Arm | Qty: 2 @ $80.00 = $160.00\n\nSubtotal: $1,000.00\nVAT (15%): $150.00\nTOTAL AMOUNT CHARGED: $1,210.00  <-- [OCR smudge misread: $1,150.00 as $1,210.00]`,
    data: {
      docType: 'Receipt',
      invoiceNo: 'APX-99412',
      vendor: 'Apex Office Hardware & Displays',
      issueDate: '2026-10-22',
      currency: 'USD',
      subtotal: 1000.00,
      tax: 150.00,
      total: 1210.00, // Intentional mismatch: 1000 + 150 = 1150 != 1210
      lineItems: [
        { description: '4K UltraSharp 27" USB-C Monitor', qty: 2, unitPrice: 420.00 },
        { description: 'Ergonomic Heavy-Duty Desk Mount Arm', qty: 2, unitPrice: 80.00 }
      ]
    },
    history: [
      { time: '09:18:14', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received PNG Image (1,420 KB)' },
      { time: '09:18:16', stage: 'Stage 2: OCR Extraction', engine: 'EasyOCR Model', detail: 'Extracted text via optical character recognition (Confidence: 87.2%)' },
      { time: '09:18:18', stage: 'Stage 3: AI Extraction', engine: 'Gemini 2.5 Flash', detail: 'Extracted JSON schema with detected numbers' },
      { time: '09:18:19', stage: 'Stage 4: Validation Engine', engine: 'Deterministic Rule Engine', detail: 'FLAGGED: Numeric Calculation Mismatch ($1,000.00 + $150.00 != $1,210.00)' }
    ]
  },
  {
    id: 'doc-103',
    filename: 'Q4_Procurement_Order.xlsx',
    format: 'EXCEL',
    subType: 'Excel Spreadsheet',
    sizeKb: 84,
    engine: 'Pandas + OpenPyXL Parser',
    ocrConfidence: 100.0,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-10-31 09:20:01',
    semanticTags: ['software licenses', 'analytics', 'dataforge', 'enterprise bi', 'procurement'],
    extractedText: `[Pandas Tabular Dump - Sheet: PO_Summary]\nPurchase Order Number: PO-2026-4410\nVendor Entity: DataForge Analytics Inc.\nEffective Date: 2026-10-25\nCurrency: USD\n\nLine Item Rows:\nRow 1: Enterprise BI Seat License | Qty: 10 | Unit: $95.00 | LineTotal: $950.00\nRow 2: Automated Connector Addon | Qty: 1 | Unit: $250.00 | LineTotal: $250.00\n\nSubtotal: $1,200.00\nTax (5%): $60.00\nTotal Order Value: $1,260.00`,
    data: {
      docType: 'Purchase Order',
      invoiceNo: 'PO-2026-4410',
      vendor: 'DataForge Analytics Inc.',
      issueDate: '2026-10-25',
      currency: 'USD',
      subtotal: 1200.00,
      tax: 60.00,
      total: 1260.00,
      lineItems: [
        { description: 'Enterprise BI Seat License', qty: 10, unitPrice: 95.00 },
        { description: 'Automated Connector Addon', qty: 1, unitPrice: 250.00 }
      ]
    },
    history: [
      { time: '09:20:01', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received Excel Workbook (.xlsx, 84 KB)' },
      { time: '09:20:02', stage: 'Stage 2: Tabular Extraction', engine: 'Pandas + OpenPyXL', detail: 'Parsed multi-cell dataframes without OCR noise (100% precision)' },
      { time: '09:20:03', stage: 'Stage 3: AI Extraction', engine: 'Gemini 2.5 Flash', detail: 'Mapped tabular headers to standard accounting schema' },
      { time: '09:20:04', stage: 'Stage 4: Validation Engine', engine: 'Deterministic Rule Engine', detail: 'All 4 validation checks passed successfully' },
      { time: '09:20:04', stage: 'Stage 5: SQLite Storage', engine: 'DocStore', detail: 'Committed to repository' }
    ]
  },
  {
    id: 'doc-104',
    filename: 'October_Logistics_Expenses.csv',
    format: 'CSV',
    subType: 'CSV Data File',
    sizeKb: 32,
    engine: 'Pandas CSV Parser',
    ocrConfidence: 100.0,
    stage: 5,
    progress: 100,
    status: 'FLAGGED',
    uploadTime: '2026-10-31 09:24:11',
    semanticTags: ['logistics', 'air freight', 'swiftcargo', 'transport', 'missing field'],
    extractedText: `invoice_no,vendor,issue_date,currency,item_desc,qty,unit_price,subtotal,tax,total\n,SwiftCargo Express,2026-10-28,USD,Air Freight Express Priority Dispatch,3,180.00,540.00,27.00,567.00`,
    data: {
      docType: 'Expense Log',
      invoiceNo: '', // Intentionally missing!
      vendor: 'SwiftCargo Express',
      issueDate: '2026-10-28',
      currency: 'USD',
      subtotal: 540.00,
      tax: 27.00,
      total: 567.00,
      lineItems: [
        { description: 'Air Freight Express Priority Dispatch', qty: 3, unitPrice: 180.00 }
      ]
    },
    history: [
      { time: '09:24:11', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received CSV File (32 KB)' },
      { time: '09:24:12', stage: 'Stage 2: Structured Parse', engine: 'Pandas CSV', detail: 'Parsed CSV row stream into memory' },
      { time: '09:24:13', stage: 'Stage 3: AI Extraction', engine: 'Gemini 2.5 Flash', detail: 'Standardized schema: Invoice # is empty string' },
      { time: '09:24:14', stage: 'Stage 4: Validation Engine', engine: 'Deterministic Rule Engine', detail: 'FLAGGED: Missing required field (Invoice / Reference Number is blank)' }
    ]
  },
  {
    id: 'doc-105',
    filename: 'Azure_Cloud_Tenant_Bill.pdf',
    format: 'PDF',
    subType: 'Digital Native PDF',
    sizeKb: 312,
    engine: 'PyMuPDF Direct Text Parser',
    ocrConfidence: 99.1,
    stage: 5,
    progress: 100,
    status: 'VALID',
    uploadTime: '2026-10-31 10:02:15',
    semanticTags: ['cloud', 'azure', 'blob storage', 'virtual network', 'microsoft'],
    extractedText: `MICROSOFT AZURE INVOICE\nInvoice: MSFT-908123\nDate: 2026-10-15\nCurrency: USD\n1. Azure Premium SSD v2 (4TB): $480.00\n2. Standard NAT Gateway & Public IP: $120.00\nSubtotal: $600.00\nTax (0%): $0.00\nTotal Due: $600.00`,
    data: {
      docType: 'Invoice',
      invoiceNo: 'MSFT-908123',
      vendor: 'Microsoft Azure Cloud',
      issueDate: '2026-10-15',
      currency: 'USD',
      subtotal: 600.00,
      tax: 0.00,
      total: 600.00,
      lineItems: [
        { description: 'Azure Premium SSD v2 (4TB)', qty: 1, unitPrice: 480.00 },
        { description: 'Standard NAT Gateway & Public IP', qty: 1, unitPrice: 120.00 }
      ]
    },
    history: [
      { time: '10:02:15', stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: 'Received Digital PDF (312 KB)' },
      { time: '10:02:16', stage: 'Stage 2: Text Extraction', engine: 'PyMuPDF Engine', detail: 'Parsed vector text streams cleanly' },
      { time: '10:02:17', stage: 'Stage 3: AI Extraction', engine: 'Gemini 2.5 Flash', detail: 'Mapped line items' },
      { time: '10:02:18', stage: 'Stage 4: Validation Engine', engine: 'Rule Engine', detail: 'Validation passed cleanly' }
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

