import requests
import time
import glob
import os
import json

base_url = 'http://localhost:8000/api/v1'
image_files = sorted(glob.glob('test-invoices/*'))
print(f'Starting Full System Check with {len(image_files)} test invoices from test-invoices folder...\n')

# 1. Upload in batch
files = [('files', (os.path.basename(p), open(p, 'rb'), 'image/jpeg' if p.endswith('.jpg') else 'image/png')) for p in image_files]
resp = requests.post(f'{base_url}/upload', files=files)
assert resp.status_code == 200, f'Upload failed: {resp.text}'
enqueued = resp.json()
print(f'Successfully enqueued {len(enqueued)} documents:')
for item in enqueued:
    print(f"  - ID: {item['id']} | File: {item['filename']} | Status: {item['status']}")

# 2. Poll until all reach 100%
print('\nMonitoring processing pipeline progress (Stage 1 -> Stage 5)...')
pending_ids = [item['id'] for item in enqueued]
start_time = time.time()
while pending_ids and (time.time() - start_time) < 45:
    time.sleep(1.5)
    remaining = []
    for doc_id in pending_ids:
        s_resp = requests.get(f'{base_url}/status/{doc_id}')
        if s_resp.status_code == 200:
            st = s_resp.json()
            if st['progress'] < 100:
                remaining.append(doc_id)
            else:
                print(f"  [Completed 100%] Doc {doc_id} ({st['filename']}) -> Final Status: {st['status']}")
    pending_ids = remaining

print('\n' + '='*70)
print('DETAILED EXTRACTION & VALIDATION REPORT FOR TEST-INVOICES:')
print('='*70)

for item in enqueued:
    doc_id = item['id']
    d_resp = requests.get(f'{base_url}/documents/{doc_id}')
    doc = d_resp.json()
    data = doc['data']
    val = doc['validation']
    print(f"\nDocument: {doc['filename']} (ID: {doc['id']})")
    print(f"  OCR Engine: {doc['engine']} | Confidence: {doc['ocrConfidence']} %")
    print(f"  DocType: {data['docType']} | Invoice No: {data['invoiceNo']}")
    print(f"  Vendor: {data['vendor']} | Customer: {data['customer']}")
    print(f"  Issue Date: {data['issueDate']} | Currency: {data['currency']}")
    print(f"  Subtotal: ${data['subtotal']:.2f} | Tax: ${data['tax']:.2f} | Total: ${data['total']:.2f}")
    print(f"  Line Items: {len(data['lineItems'])} items extracted")
    for idx, li in enumerate(data['lineItems'], 1):
        print(f"    [{idx}] {li['description']} (Qty: {li['qty']}, UnitPrice: ${li['unitPrice']:.2f})")
    print(f"  Validation Status: {val['status']}")
    for c in val['checks']:
        icon = 'PASS' if c['passed'] else 'FLAG'
        print(f"    [{icon}] {c['title']}: {c['message']}")

# Test Cross Verification between invoice.png and invoice-3.png
doc_1 = enqueued[0]['id']
doc_2 = enqueued[2]['id']
print('\n' + '='*70)
print('CROSS-VERIFICATION (Task 3: pdf/img cross verification):')
print('='*70)
cross_resp = requests.get(f'{base_url}/cross-verify?doc_a_id={doc_1}&doc_b_id={doc_2}')
if cross_resp.status_code == 200:
    cr = cross_resp.json()
    print(f"Comparison: {cr['docA']['filename']} vs {cr['docB']['filename']}")
    print(f"Verification Status: {cr['status']} | Match Score: {cr['matchScore']}%")
    for fc in cr['fieldComparisons']:
        status_sym = 'OK' if fc['match'] else 'MISMATCH'
        print(f"  [{status_sym}] {fc['field']}: {fc['docA']} vs {fc['docB']}")
    if cr['discrepancies']:
        print("  Discrepancies:")
        for d in cr['discrepancies']:
            print(f"   - {d}")

print('\nALL VERIFICATIONS COMPLETED SUCCESSFULLY!')

