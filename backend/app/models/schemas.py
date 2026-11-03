from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class LineItem(BaseModel):
    description: str = Field(default="", description="Description of product or service")
    qty: float = Field(default=1.0, description="Quantity")
    unitPrice: float = Field(default=0.0, description="Unit price or rate")

class ExtractedData(BaseModel):
    isFinancialDocument: bool = Field(default=True, description="Whether document is recognized as a financial billing document")
    docType: str = Field(default="Invoice", description="Classified type of document (Invoice, Receipt, PO, Expense Log, Non-Financial Document)")
    invoiceNo: Optional[str] = Field(default="", description="Invoice or reference number")
    vendor: Optional[str] = Field(default="", description="Vendor, supplier, or issuer name")
    customer: Optional[str] = Field(default="", description="Customer, buyer, or client name")
    issueDate: Optional[str] = Field(default="", description="Date of document issue (YYYY-MM-DD)")
    currency: str = Field(default="USD", description="Currency symbol or code (USD, EUR, GBP, BDT)")
    subtotal: float = Field(default=0.0, description="Sum of line items before taxes")
    tax: float = Field(default=0.0, description="Tax or VAT amount")
    total: float = Field(default=0.0, description="Total due amount")
    lineItems: List[LineItem] = Field(default_factory=list, description="Extracted line item details")
    notes: Optional[str] = Field(default="", description="Classification or extraction notes")

class ValidationCheck(BaseModel):
    id: str
    title: str
    passed: bool
    message: str

class ValidationReport(BaseModel):
    passed: bool
    status: str  # "VALID" or "FLAGGED"
    errors: List[str] = Field(default_factory=list)
    checks: List[ValidationCheck] = Field(default_factory=list)

class HistoryEntry(BaseModel):
    time: str
    stage: str
    engine: str
    detail: str

class DocumentResponse(BaseModel):
    id: str
    filename: str
    format: str  # "PDF", "IMAGE", "EXCEL", "CSV"
    subType: str
    sizeKb: int
    engine: str
    ocrConfidence: float
    stage: int  # 1 to 5
    progress: int  # 0 to 100
    status: str  # "PROCESSING", "VALID", "FLAGGED"
    uploadTime: str
    semanticTags: List[str] = Field(default_factory=list)
    extractedText: str = ""
    data: ExtractedData
    validation: ValidationReport
    history: List[HistoryEntry] = Field(default_factory=list)

class DocumentCorrectionRequest(BaseModel):
    docType: Optional[str] = None
    invoiceNo: Optional[str] = None
    vendor: Optional[str] = None
    customer: Optional[str] = None
    issueDate: Optional[str] = None
    currency: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    lineItems: Optional[List[LineItem]] = None

class SearchResultItem(BaseModel):
    doc: DocumentResponse
    score: float
    matchType: str

class SearchResponse(BaseModel):
    query: str
    mode: str
    totalMatches: int
    results: List[SearchResultItem]

class PipelineStatusResponse(BaseModel):
    id: str
    filename: str
    stage: int
    progress: int
    status: str
    currentStageName: str
    history: List[HistoryEntry]

