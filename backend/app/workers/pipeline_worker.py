import time
import os
import asyncio
from datetime import datetime
from typing import Dict, Any

from app.database import save_full_document, fetch_document_by_id, get_connection
from app.pipeline.stage2_extractor import extract_text_and_confidence
from app.pipeline.stage3_ai_gemini import extract_structured_entities_with_gemini
from app.pipeline.stage4_validator import evaluate_validation
from app.pipeline.stage5_indexer import generate_semantic_tags

def run_document_pipeline_sync(doc_dict: Dict[str, Any]):
    """
    Executes the 5-Stage Autonomous Extraction & Validation Pipeline.
    Runs asynchronously in FastAPI BackgroundTasks.
    """
    doc_id = doc_dict["id"]
    filename = doc_dict["filename"]
    file_path = doc_dict.get("file_path", "")
    format_type = doc_dict["format"]

    # Ensure file_path is resolved on disk for OCR
    if not file_path or not os.path.exists(file_path):
        from app.pipeline.stage2_extractor import find_valid_file_path
        resolved = find_valid_file_path(filename) or find_valid_file_path(f"{doc_id}_{filename}")
        if resolved:
            file_path = str(resolved)
            doc_dict["file_path"] = file_path

    history = doc_dict.get("history", [])
    history.append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "stage": "Stage 1: Document Ingestion",
        "engine": "Upload Gateway",
        "detail": f"Registered file {filename} ({doc_dict.get('sizeKb', 0)} KB)"
    })

    # Save Stage 1 state
    doc_dict["stage"] = 1
    doc_dict["progress"] = 20
    doc_dict["history"] = history
    save_full_document(doc_dict)
    time.sleep(0.4)

    # Stage 2: Text Extraction / OCR
    extracted_text, engine_name, ocr_conf = extract_text_and_confidence(file_path, format_type)
    history.append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "stage": "Stage 2: Text Extraction / OCR",
        "engine": engine_name,
        "detail": f"Extracted text stream (Confidence: {ocr_conf}%)"
    })

    doc_dict["stage"] = 2
    doc_dict["progress"] = 45
    doc_dict["engine"] = engine_name
    doc_dict["ocrConfidence"] = ocr_conf
    doc_dict["extractedText"] = extracted_text
    doc_dict["history"] = history
    save_full_document(doc_dict)
    time.sleep(0.5)

    # Stage 3: AI Information Extraction (Gemini)
    from app.config import settings
    structured_data = extract_structured_entities_with_gemini(extracted_text, filename, file_path)
    history.append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "stage": "Stage 3: AI Information Extraction",
        "engine": f"Gemini AI ({settings.GEMINI_MODEL})",
        "detail": f"Parsed {len(structured_data.get('lineItems', []))} line items into standard JSON"
    })

    doc_dict["stage"] = 3
    doc_dict["progress"] = 75
    doc_dict["data"] = structured_data
    doc_dict["history"] = history
    save_full_document(doc_dict)
    time.sleep(0.4)

    # Stage 4: Data Validation
    conn = get_connection()
    val_report = evaluate_validation(structured_data, doc_id, conn, raw_text=extracted_text)
    conn.close()

    history.append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "stage": "Stage 4: Data Validation",
        "engine": "Deterministic 4-Rule Validator",
        "detail": f"Status: {val_report.status} ({len(val_report.errors)} issue(s))"
    })

    doc_dict["stage"] = 4
    doc_dict["progress"] = 90
    doc_dict["status"] = val_report.status
    doc_dict["history"] = history
    save_full_document(doc_dict)
    time.sleep(0.3)

    # Stage 5: Save & Search Indexer
    tags = generate_semantic_tags(filename, structured_data.get("vendor", ""), extracted_text)
    history.append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "stage": "Stage 5: Save & Search Index",
        "engine": "SQLite & Vector Store",
        "detail": f"Committed record and generated {len(tags)} semantic concept tags"
    })

    doc_dict["stage"] = 5
    doc_dict["progress"] = 100
    doc_dict["semanticTags"] = tags
    doc_dict["history"] = history
    save_full_document(doc_dict)

    print(f"[Pipeline Worker] Completed processing {doc_id} ({filename}) with status {doc_dict['status']}")

