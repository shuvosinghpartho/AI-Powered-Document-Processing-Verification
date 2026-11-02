import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

@pytest.fixture(autouse=True)
def setup():
    init_db()

client = TestClient(app)

def test_health_endpoints():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_list_documents():
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    docs = response.json()
    assert isinstance(docs, list)
    assert len(docs) >= 4  # Initial seeded sample documents

def test_get_single_document():
    response = client.get("/api/v1/documents/doc-101")
    assert response.status_code == 200
    doc = response.json()
    assert doc["id"] == "doc-101"
    assert doc["status"] == "VALID"
    assert doc["format"] == "PDF"

def test_search_documents():
    # Keyword search
    kw_res = client.get("/api/v1/search?q=Nimbus&mode=keyword")
    assert kw_res.status_code == 200
    assert kw_res.json()["totalMatches"] >= 1

    # Semantic search
    sem_res = client.get("/api/v1/search?q=gpu%20hosting%20server&mode=semantic")
    assert sem_res.status_code == 200
    assert sem_res.json()["totalMatches"] >= 1

def test_correct_document_values():
    # Correct doc-102 math mismatch ($1210 -> $1150)
    payload = {
        "total": 1150.00
    }
    response = client.put("/api/v1/documents/doc-102", json=payload)
    assert response.status_code == 200
    updated = response.json()
    assert updated["data"]["total"] == 1150.00
    assert updated["status"] == "VALID"  # Status changes from FLAGGED to VALID

def test_cross_verify_documents():
    # Cross-verify two distinct documents
    response = client.get("/api/v1/cross-verify?doc_a_id=doc-101&doc_b_id=doc-102")
    assert response.status_code == 200
    data = response.json()
    assert "docA" in data
    assert "docB" in data
    assert "matchScore" in data
    assert "fieldComparisons" in data
    assert "status" in data

def test_empty_file_upload_rejected():
    # Attempt to upload an empty file
    response = client.post(
        "/api/v1/upload",
        files=[("files", ("empty.pdf", b"", "application/pdf"))]
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_unsupported_file_extension_rejected():
    # Attempt to upload unsupported format
    response = client.post(
        "/api/v1/upload",
        files=[("files", ("malicious.exe", b"MZ...", "application/octet-stream"))]
    )
    assert response.status_code == 400
    assert "unsupported" in response.json()["detail"].lower()


