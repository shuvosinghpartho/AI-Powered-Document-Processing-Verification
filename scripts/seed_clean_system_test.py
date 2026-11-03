import sqlite3
import os
import sys
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.database import get_connection, save_full_document, init_db
from app.seed_data import SEED_DOCUMENTS

print("=== STARTING COMPLETE SYSTEM TEST ACROSS ALL DOCUMENT TYPES ===")

# 1. Clear out old documents from database
conn = get_connection()
cursor = conn.cursor()
cursor.execute("DELETE FROM documents")
cursor.execute("DELETE FROM extracted_text")
cursor.execute("DELETE FROM structured_results")
cursor.execute("DELETE FROM validation_errors")
cursor.execute("DELETE FROM processing_history")
conn.commit()
print("Step 1: Successfully wiped all old records from SQLite database.")

# 2. Commit each document from curated battery
for d in SEED_DOCUMENTS:
    save_full_document(d, conn)
    print(f"Committed {d['id']}: {d['filename']} ({d['format']}) -> Status: {d['status']}")

conn.close()
print(f"=== ALL {len(SEED_DOCUMENTS)} REPRESENTATIVE TEST DOCUMENTS COMMITTED TO DB SUCCESSFULLY ===")
