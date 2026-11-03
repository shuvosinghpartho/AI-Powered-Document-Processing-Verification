import requests
import json
import time

BASE = "http://localhost:8000/api/v1"

print("1. Testing Health...")
h = requests.get("http://localhost:8000/health").json()
assert h["status"] == "healthy", f"Health failed: {h}"
print(f"   Health OK: {h}")

print("2. Testing Document List...")
docs = requests.get(f"{BASE}/documents").json()
assert len(docs) >= 10, f"Expected at least 10 docs, got {len(docs)}"
print(f"   Documents OK: Found {len(docs)} documents.")

print("3. Testing Single Document Fetch (doc-001)...")
d1 = requests.get(f"{BASE}/documents/doc-001").json()
assert d1["id"] == "doc-001"
assert d1["status"] == "VALID"
assert d1["data"]["total"] == 1650.0
fn = d1["filename"]
tot = d1["data"]["total"]
print(f"   Doc-001 OK: {fn} - ${tot}")

print("4. Testing Keyword Search...")
kw = requests.get(f"{BASE}/search?q=Nimbus&mode=keyword").json()
assert kw["totalMatches"] >= 1
print(f"   Keyword Search OK: {kw['totalMatches']} matches for Nimbus")

print("5. Testing Semantic Search...")
sem = requests.get(f"{BASE}/search?q=gpu%20cloud%20cluster&mode=semantic").json()
assert sem["totalMatches"] >= 1
print(f"   Semantic Search OK: {sem['totalMatches']} matches for gpu cloud cluster")

print("6. Testing Cross Verification (PDF-PDF: doc-001 vs doc-002)...")
cv_pdf = requests.get(f"{BASE}/cross-verify?doc_a_id=doc-001&doc_b_id=doc-002").json()
assert cv_pdf["verificationType"] == "PDF - PDF Cross-Check"
print(f"   PDF-PDF Cross-Verify OK: Match Score {cv_pdf['matchScore']}%, Status: {cv_pdf['status']}")

print("7. Testing Cross Verification (PDF-Excel: doc-001 vs doc-006)...")
cv_excel = requests.get(f"{BASE}/cross-verify?doc_a_id=doc-001&doc_b_id=doc-006").json()
assert cv_excel["verificationType"] == "PDF - EXCEL Cross-Check"
print(f"   PDF-Excel Cross-Verify OK: Match Score {cv_excel['matchScore']}%, Status: {cv_excel['status']}")

print("8. Testing Manual Correction API on doc-005...")
corr_resp = requests.put(f"{BASE}/documents/doc-005", json={"total": 1150.0, "customer": "Apex Verified Client"}).json()
assert corr_resp["data"]["total"] == 1150.0
assert corr_resp["data"]["customer"] == "Apex Verified Client"
assert corr_resp["status"] == "VALID"
print("   Correction OK: Updated doc-005 to VALID with customer name Apex Verified Client")

print("9. Testing Reprocess API on doc-005...")
rep_resp = requests.post(f"{BASE}/reprocess/doc-005").json()
assert rep_resp["status"] == "PROCESSING"
print(f"   Reprocess Triggered OK: {rep_resp['message']}")

print("10. Testing Error Rejection (Empty File)...")
empty_res = requests.post(f"{BASE}/upload", files={"files": ("empty.pdf", b"", "application/pdf")})
assert empty_res.status_code == 400
print("   Empty File Rejection OK: 400 Bad Request received as expected")

print("11. Testing Error Rejection (Unsupported File)...")
unsupp_res = requests.post(f"{BASE}/upload", files={"files": ("malware.exe", b"binarydata", "application/octet-stream")})
assert unsupp_res.status_code == 400
print("   Unsupported File Rejection OK: 400 Bad Request received as expected")

print("\n=== ALL 11 FUNCTIONAL API TESTS PASSED WITH 100% SUCCESS ===")

