import os
import re
import uuid
import shutil
from pathlib import Path
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.config import settings

def ingest_file(upload_file: UploadFile) -> dict:
    """Stage 1: Document Input - format detection, sanitization, hashing, and storage."""
    original_filename = upload_file.filename or "unknown_file"
    
    # Sanitize filename to protect against path traversal and special characters
    clean_filename = Path(original_filename).name
    clean_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', clean_filename)
    if not clean_filename or clean_filename.startswith('.'):
        clean_filename = f"upload_{clean_filename}"

    ext = Path(clean_filename).suffix.lower()

    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported format '{ext}'. Supported: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Determine standard format category
    if ext in [".pdf"]:
        format_type = "PDF"
        sub_type = "PDF Document"
    elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"]:
        format_type = "IMAGE"
        sub_type = f"Vision Image ({ext.replace('.', '').upper()})"
    elif ext in [".xlsx", ".xls"]:
        format_type = "EXCEL"
        sub_type = "Excel Workbook"
    elif ext in [".csv"]:
        format_type = "CSV"
        sub_type = "Delimited CSV Stream"
    else:
        format_type = "OTHER"
        sub_type = "Binary Document"

    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    saved_filename = f"{doc_id}_{clean_filename}"
    saved_path = settings.UPLOAD_DIR / saved_filename

    # Save to disk
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    file_size = os.path.getsize(saved_path)
    if file_size == 0:
        if saved_path.exists():
            os.remove(saved_path)
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty (0 bytes). Please upload a valid document."
        )

    # Max file size limit: 50MB
    MAX_FILE_SIZE = 50 * 1024 * 1024
    if file_size > MAX_FILE_SIZE:
        if saved_path.exists():
            os.remove(saved_path)
        raise HTTPException(
            status_code=400,
            detail="File exceeds maximum allowed size of 50MB."
        )

    size_kb = max(1, round(file_size / 1024))

    return {
        "id": doc_id,
        "filename": clean_filename,
        "file_path": str(saved_path),
        "format": format_type,
        "subType": sub_type,
        "sizeKb": size_kb,
        "uploadTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "stage": 1,
        "progress": 20
    }

