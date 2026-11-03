import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import DocumentList from './components/DocumentList.jsx';
import DocumentInspector from './components/DocumentInspector.jsx';
import ReviewQueue from './components/ReviewQueue.jsx';
import CrossVerification from './components/CrossVerification.jsx';
import UploadModal from './components/UploadModal.jsx';
import SearchPage from './components/SearchPage.jsx';
import FastApiModal from './components/FastApiModal.jsx';
import ToastContainer from './components/Toast.jsx';
import { Sparkles } from 'lucide-react';

import { 
  INITIAL_DOCUMENTS, 
  runValidationRules 
} from './data/mockDocuments.js';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('docu_theme') || 'dark';
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'documents', 'review_queue', 'inspector'
  const [selectedDocId, setSelectedDocId] = useState('doc-102'); // start on flagged to inspect
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFastApiOpen, setIsFastApiOpen] = useState(false);

  const [fastApiConfig, setFastApiConfig] = useState({
    baseUrl: 'http://localhost:8000',
    mode: 'live' // Connected to live backend
  });

  const [toasts, setToasts] = useState([]);

  // Auto-fetch live documents from FastAPI on mount
  useEffect(() => {
    async function loadBackendDocuments() {
      try {
        const res = await fetch(`${fastApiConfig.baseUrl}/api/v1/documents`);
        if (res.ok) {
          const liveDocs = await res.json();
          if (Array.isArray(liveDocs) && liveDocs.length > 0) {
            setDocuments(liveDocs);
            setFastApiConfig(prev => ({ ...prev, mode: 'live' }));
          }
        }
      } catch (err) {
        console.warn('FastAPI not reachable, using in-browser simulator:', err);
        setFastApiConfig(prev => ({ ...prev, mode: 'simulator' }));
      } finally {
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 600);
      }
    }
    loadBackendDocuments();
  }, [fastApiConfig.baseUrl]);

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('docu_theme', theme);
  }, [theme]);

  // Keyboard Shortcut: Cmd/Ctrl + K opens search page
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCurrentTab('search');
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast Notification
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Selected Document
  const selectedDoc = useMemo(() => {
    return documents.find(d => d.id === selectedDocId) || documents[0] || null;
  }, [documents, selectedDocId]);

  const flaggedCount = useMemo(() => {
    return documents.filter(d => d.status === 'FLAGGED').length;
  }, [documents]);

  // Open Document Inspector
  const handleInspectDoc = (id) => {
    setSelectedDocId(id);
    setCurrentTab('inspector');
  };

  // Update Document in State & Backend
  const handleUpdateDocument = async (updatedDoc) => {
    // Optimistic UI update
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));

    if (fastApiConfig.mode === 'live') {
      try {
        const res = await fetch(`${fastApiConfig.baseUrl}/api/v1/documents/${updatedDoc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDoc.data)
        });
        if (res.ok) {
          const fresh = await res.json();
          setDocuments(prev => prev.map(d => d.id === fresh.id ? fresh : d));
        }
      } catch (err) {
        console.error('FastAPI update error:', err);
      }
    }
  };

  // Reprocess single document
  const handleReprocessDoc = async (docId) => {
    if (fastApiConfig.mode === 'live') {
      try {
        addToast('Reprocessing document through validation pipeline...', 'info');
        const res = await fetch(`${fastApiConfig.baseUrl}/api/v1/documents/${docId}/reprocess`, {
          method: 'POST'
        });
        if (res.ok) {
          // Poll status
          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await fetch(`${fastApiConfig.baseUrl}/api/v1/status/${docId}`);
              if (statusRes.ok) {
                const st = await statusRes.json();
                setDocuments(prev => prev.map(d => d.id === docId ? { ...d, stage: st.stage, progress: st.progress, status: st.status, history: st.history } : d));
                if (st.progress >= 100) {
                  clearInterval(pollInterval);
                  // Refresh full doc
                  const fullRes = await fetch(`${fastApiConfig.baseUrl}/api/v1/documents/${docId}`);
                  if (fullRes.ok) {
                    const fullDoc = await fullRes.json();
                    setDocuments(prev => prev.map(d => d.id === docId ? fullDoc : d));
                    addToast(`Reprocess complete!`, 'success');
                  }
                }
              }
            } catch (e) {
              clearInterval(pollInterval);
            }
          }, 800);
          return;
        }
      } catch (err) {
        console.warn('Fallback to local reprocess:', err);
      }
    }

    // Simulator fallback
    triggerPipeline(docId);
  };

  // Trigger 5-stage processing pipeline for new or reprocessed docs
  const triggerPipeline = useCallback((docId) => {
    const stages = [
      { stage: 1, progress: 20, name: 'Stage 1: Document Ingest', engine: 'Upload Gateway', detail: 'Received stream, calculating hash' },
      { stage: 2, progress: 45, name: 'Stage 2: OCR Extraction', engine: 'Vision Engine / PyMuPDF', detail: 'Generating high-fidelity text tokens' },
      { stage: 3, progress: 75, name: 'Stage 3: AI Extraction', engine: 'Gemini 2.5 Flash', detail: 'Running multimodal entity schema mapping' },
      { stage: 4, progress: 90, name: 'Stage 4: Validation Engine', engine: 'Deterministic Rule Engine', detail: 'Executing 4 verification rules' },
      { stage: 5, progress: 100, name: 'Stage 5: Commit & Store', engine: 'DocStore & Vector Index', detail: 'Committed to repository and embeddings indexed' },
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < stages.length) {
        const s = stages[step];
        setDocuments(prev => prev.map(d => {
          if (d.id !== docId) return d;
          return {
            ...d,
            stage: s.stage,
            progress: s.progress,
            history: [
              ...(d.history || []),
              {
                time: new Date().toLocaleTimeString(),
                stage: s.name,
                engine: s.engine,
                detail: s.detail
              }
            ]
          };
        }));
        step++;
      } else {
        clearInterval(interval);
        setDocuments(prev => prev.map(d => {
          if (d.id !== docId) return d;
          const val = runValidationRules(d, prev);
          return {
            ...d,
            progress: 100,
            status: val.status
          };
        }));
        addToast(`Document pipeline complete!`, 'success');
      }
    }, 600);
  }, [addToast]);

  // Handle Multi-file Upload (Live FastAPI + Simulator Fallback)
  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploadOpen(false);

    if (fastApiConfig.mode === 'live') {
      try {
        const formData = new FormData();
        Array.from(files).forEach(f => formData.append('files', f));

        addToast(`Uploading ${files.length} document(s) to FastAPI pipeline...`, 'info');
        const res = await fetch(`${fastApiConfig.baseUrl}/api/v1/upload`, {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const enqueued = await res.json();
          // Insert initial queued documents into state
          const placeholders = enqueued.map(item => ({
            id: item.id,
            filename: item.filename,
            format: item.format,
            subType: `${item.format} Document`,
            sizeKb: 120,
            engine: 'Upload Gateway & Worker',
            ocrConfidence: 90.0,
            stage: 1,
            progress: 20,
            status: 'PROCESSING',
            uploadTime: new Date().toLocaleTimeString(),
            semanticTags: ['pipeline-processing'],
            extractedText: 'Processing document through extraction & validation pipeline...',
            data: { docType: 'Invoice', invoiceNo: 'Pending...', vendor: 'Extracting...', issueDate: '', currency: 'USD', subtotal: 0, tax: 0, total: 0, lineItems: [] },
            history: [{ time: new Date().toLocaleTimeString(), stage: 'Stage 1: Document Ingestion', engine: 'Upload Gateway', detail: `Registered ${item.filename}` }]
          }));

          setDocuments(prev => [...placeholders, ...prev]);
          if (placeholders.length > 0) {
            setSelectedDocId(placeholders[0].id);
          }
          setCurrentTab('documents');

          // Poll each document until complete (fast 300ms intervals)
          placeholders.forEach(docItem => {
            const docId = docItem.id;
            let pollAttempts = 0;
            const pollInterval = setInterval(async () => {
              pollAttempts++;
              try {
                const sRes = await fetch(`${fastApiConfig.baseUrl}/api/v1/status/${docId}`);
                if (sRes.ok) {
                  const st = await sRes.json();
                  setDocuments(prev => prev.map(d => d.id === docId ? { 
                    ...d, 
                    stage: st.stage, 
                    progress: st.progress, 
                    status: st.status,
                    history: st.history || d.history
                  } : d));

                  if (st.progress >= 100 || st.status === 'VALID' || st.status === 'FLAGGED' || st.status === 'ERROR' || pollAttempts >= 60) {
                    clearInterval(pollInterval);
                    // Fetch full document with extracted JSON and validation checks
                    const fRes = await fetch(`${fastApiConfig.baseUrl}/api/v1/documents/${docId}`);
                    if (fRes.ok) {
                      const fullDoc = await fRes.json();
                      setDocuments(prev => prev.map(d => d.id === docId ? fullDoc : d));
                      addToast(`${docItem.filename} processed successfully!`, 'success');
                    }
                  }
                } else if (pollAttempts >= 60) {
                  clearInterval(pollInterval);
                }
              } catch (e) {
                if (pollAttempts >= 60) {
                  clearInterval(pollInterval);
                }
              }
            }, 300);
          });
          return;
        }
      } catch (err) {
        console.warn('Live upload failed, falling back to simulator:', err);
      }
    }

    // In-browser simulator fallback
    const newDocs = Array.from(files).map((file, idx) => {
      const ext = file.name.split('.').pop().toUpperCase();
      let format = 'PDF';
      if (['PNG', 'JPG', 'JPEG', 'WEBP'].includes(ext)) format = 'IMAGE';
      if (['XLSX', 'XLS'].includes(ext)) format = 'EXCEL';
      if (['CSV'].includes(ext)) format = 'CSV';

      const docId = `doc-${Date.now()}-${idx}`;
      const isLikelyInvoice = /(invoice|receipt|bill|po[-_]|order|expense|cost|charge|financial)/i.test(file.name);
      return {
        id: docId,
        filename: file.name,
        format,
        subType: `${format} File`,
        sizeKb: Math.round(file.size / 1024) || 150,
        engine: format === 'IMAGE' ? 'EasyOCR Vision Engine' : (format === 'PDF' ? 'PyMuPDF Parser' : 'Pandas Tabular'),
        ocrConfidence: isLikelyInvoice ? 95.2 : 40.0,
        stage: 1,
        progress: 15,
        status: 'PROCESSING',
        uploadTime: new Date().toLocaleString(),
        semanticTags: isLikelyInvoice ? ['uploaded document', 'invoice'] : ['uploaded document', 'non-financial'],
        extractedText: isLikelyInvoice
          ? `Extracted text stream from ${file.name}...\nProcessed with Document Intelligence Pipeline.`
          : `Unrelated media or document content extracted from ${file.name}.\nNo commercial billing or invoice transactions detected.`,
        data: isLikelyInvoice ? {
          isFinancialDocument: true,
          docType: 'Invoice',
          invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          vendor: 'Enterprise Cloud Systems LLC',
          issueDate: new Date().toISOString().split('T')[0],
          currency: 'USD',
          subtotal: 820.00,
          tax: 82.00,
          total: 902.00,
          lineItems: [
            { description: 'Cloud AI Document Inference Compute Node', qty: 1, unitPrice: 820.00 }
          ]
        } : {
          isFinancialDocument: false,
          docType: 'Non-Financial Document',
          invoiceNo: '',
          vendor: '',
          customer: '',
          issueDate: '',
          currency: 'USD',
          subtotal: 0,
          tax: 0,
          total: 0,
          lineItems: []
        },
        history: [
          { time: new Date().toLocaleTimeString(), stage: 'Stage 1: Document Ingest', engine: 'Upload Gateway', detail: `Received ${file.name}` }
        ]
      };
    });

    setDocuments(prev => [...newDocs, ...prev]);
    setSelectedDocId(newDocs[0].id);
    setCurrentTab('documents');
    addToast(`Queued ${newDocs.length} document(s) for extraction`, 'info');

    newDocs.forEach(d => {
      setTimeout(() => triggerPipeline(d.id), 250);
    });
  };

  // Inject Preset Document
  const handleAddPreset = (type) => {
    let preset;
    const id = `doc-${Date.now()}`;
    const time = new Date().toLocaleTimeString();

    if (type === 'test_invoices_batch') {
      addToast('Dispatching batch on test-invoices folder...', 'info');
      fetch(`${fastApiConfig.baseUrl}/api/v1/test-invoices/ingest`, { method: 'POST' })
        .then(res => res.json())
        .then(enqueued => {
          addToast(`Enqueued ${enqueued.length} document(s) for extraction!`, 'success');
          // Poll and refresh repository
          let count = 0;
          const pollTimer = setInterval(async () => {
            count++;
            try {
              const freshRes = await fetch(`${fastApiConfig.baseUrl}/api/v1/documents`);
              if (freshRes.ok) {
                const freshDocs = await freshRes.json();
                setDocuments(freshDocs);
              }
            } catch (e) {}
            if (count >= 5) {
              clearInterval(pollTimer);
              addToast('EasyOCR processing completed for test-invoices!', 'success');
            }
          }, 1500);
          setCurrentTab('documents');
        })
        .catch(err => {
          console.error('Batch ingest error:', err);
          addToast('EasyOCR batch endpoint error', 'warning');
        });
      return;
    }

    if (type === 'flagged_math') {
      preset = {
        id,
        filename: `Scan_Receipt_MetroElectric_${Math.floor(100 + Math.random() * 900)}.png`,
        format: 'IMAGE',
        subType: 'Thermal Receipt Scan',
        sizeKb: 680,
        engine: 'EasyOCR Vision Engine',
        ocrConfidence: 86.4,
        stage: 1,
        progress: 15,
        status: 'PROCESSING',
        uploadTime: new Date().toLocaleString(),
        semanticTags: ['utility', 'power', 'receipt', 'math discrepancy'],
        extractedText: `METRO POWER & UTILITIES\nReceipt ID: MPU-88310\nDate: 2026-10-29\nCommercial Electricity: $800.00\nGrid Surcharge: $50.00\nSubtotal: $850.00\nLocal Grid Tax: $85.00\nTOTAL BILLED: $995.00  <-- [Math smudge: 850 + 85 = 935 != 995]`,
        data: {
          docType: 'Receipt',
          invoiceNo: `MPU-${Math.floor(10000 + Math.random() * 90000)}`,
          vendor: 'Metro Power & Utilities Corp',
          issueDate: '2026-10-29',
          currency: 'USD',
          subtotal: 850.00,
          tax: 85.00,
          total: 995.00, // Intentional mismatch
          lineItems: [
            { description: 'Commercial Electricity Server Grid', qty: 1, unitPrice: 800.00 },
            { description: 'Grid Surcharge', qty: 1, unitPrice: 50.00 }
          ]
        },
        history: [{ time, stage: 'Stage 1: Document Ingest', engine: 'Upload Gateway', detail: 'Received thermal receipt' }]
      };
    } else if (type === 'flagged_missing') {
      preset = {
        id,
        filename: `Freight_Consignment_Log_${Math.floor(100 + Math.random() * 900)}.csv`,
        format: 'CSV',
        subType: 'CSV Dispatch Stream',
        sizeKb: 45,
        engine: 'Pandas CSV Parser',
        ocrConfidence: 100.0,
        stage: 1,
        progress: 15,
        status: 'PROCESSING',
        uploadTime: new Date().toLocaleString(),
        semanticTags: ['freight', 'logistics', 'missing invoice number'],
        extractedText: `invoice_no,vendor,issue_date,currency,item_desc,qty,unit_price,subtotal,tax,total\n,Apex Express Couriers,2026-10-30,USD,Overnight Cold-Storage Air Freight,2,320.00,640.00,32.00,672.00`,
        data: {
          docType: 'Expense Log',
          invoiceNo: '', // Missing mandatory field
          vendor: 'Apex Express Couriers',
          issueDate: '2026-10-30',
          currency: 'USD',
          subtotal: 640.00,
          tax: 32.00,
          total: 672.00,
          lineItems: [
            { description: 'Overnight Cold-Storage Air Freight', qty: 2, unitPrice: 320.00 }
          ]
        },
        history: [{ time, stage: 'Stage 1: Document Ingest', engine: 'Upload Gateway', detail: 'Parsed CSV stream' }]
      };
    } else {
      preset = {
        id,
        filename: `DeepCompute_Cloud_Invoice_${Math.floor(100 + Math.random() * 900)}.pdf`,
        format: 'PDF',
        subType: 'Digital Native PDF',
        sizeKb: 310,
        engine: 'PyMuPDF Direct Text Parser',
        ocrConfidence: 99.8,
        stage: 1,
        progress: 15,
        status: 'PROCESSING',
        uploadTime: new Date().toLocaleString(),
        semanticTags: ['deep learning', 'gpu nodes', 'cloud computing', 'clean validation'],
        extractedText: `DEEPCOMPUTE CLOUD PLATFORM\nInvoice: DCI-55201\nVendor: DeepCompute AI Inc.\nDate: 2026-10-27\nCurrency: USD\n1. 8x H200 Tensor Core GPU Pod x 10 @ $240.00 = $2,400.00\n2. InfiniBand Fabric Fabric x 1 @ $400.00 = $400.00\nSubtotal: $2,800.00\nTax: $0.00\nTotal Due: $2,800.00`,
        data: {
          docType: 'Invoice',
          invoiceNo: `DCI-${Math.floor(10000 + Math.random() * 90000)}`,
          vendor: 'DeepCompute AI Inc.',
          issueDate: '2026-10-27',
          currency: 'USD',
          subtotal: 2800.00,
          tax: 0.00,
          total: 2800.00,
          lineItems: [
            { description: '8x H200 Tensor Core GPU Pod (Hourly)', qty: 10, unitPrice: 240.00 },
            { description: 'InfiniBand Fabric Fabric', qty: 1, unitPrice: 400.00 }
          ]
        },
        history: [{ time, stage: 'Stage 1: Document Ingest', engine: 'Upload Gateway', detail: 'Received Digital PDF' }]
      };
    }

    setDocuments(prev => [preset, ...prev]);
    setSelectedDocId(preset.id);
    setCurrentTab('documents');
    addToast(`Injected test document: ${preset.filename}`, 'info');
    setTimeout(() => triggerPipeline(preset.id), 200);
  };

  // Initial App / Backend Handshake Loading Splash Screen
  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14] text-white select-none overflow-hidden animate-fadeIn">
        {/* Ambient subtle glow background */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#1c3461]/40 via-[#2f5fb0]/25 to-[#e57824]/20 blur-3xl pointer-events-none animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
          {/* Logo / Emblem */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1c3461] via-[#2f5fb0] to-[#e57824] p-[2px] shadow-2xl shadow-[#2f5fb0]/30 animate-spin-slow">
              <div className="w-full h-full bg-[#0b1220] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-amber-300 animate-pulse" />
              </div>
            </div>
            <span className="absolute -inset-2.5 rounded-3xl border border-[#2f5fb0]/30 animate-ping opacity-25"></span>
          </div>

          {/* Brand Typography */}
          <h1 className="text-2xl font-extrabold tracking-tight font-sans text-white">
            Cottage <span className="text-[#e57824]">Intellect</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            AI-Powered Document Intelligence Platform
          </p>

          {/* Progress bar container */}
          <div className="w-56 h-1.5 rounded-full bg-slate-800/80 overflow-hidden mt-6 relative border border-slate-700/50">
            <div className="h-full bg-gradient-to-r from-[#1c3461] via-[#2f5fb0] to-[#e57824] rounded-full animate-loading-bar"></div>
          </div>

          {/* Live Engine Handshake Status */}
          <div className="flex items-center gap-2 mt-4 text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connecting to FastAPI Engine &amp; SQLite WAL...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* 1. SaaS Left Navigation Sidebar (Responsive Mobile Drawer + Desktop Collapsible) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        flaggedCount={flaggedCount}
        totalCount={documents.length}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenUpload={() => {
          setIsUploadOpen(true);
          setIsMobileMenuOpen(false);
        }}
        onOpenSearch={() => {
          setCurrentTab('search');
          setIsMobileMenuOpen(false);
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 2. SaaS Header / Topbar */}
        <Topbar
          currentTab={currentTab}
          theme={theme}
          onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          onOpenFastApi={() => setIsFastApiOpen(true)}
          onOpenSearch={() => setCurrentTab('search')}
          onAddPreset={handleAddPreset}
          fastApiMode={fastApiConfig.mode}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* 3. Spacious Viewport Body */}
        <main className={`flex-1 ${
          currentTab === 'documents' || currentTab === 'review_queue' || currentTab === 'search' || currentTab === 'inspector'
            ? 'overflow-hidden flex flex-col p-2.5 sm:p-4 md:p-6'
            : 'overflow-y-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8'
        } ambient-glow`}>
          <div className={`max-w-7xl mx-auto w-full ${
            currentTab === 'documents' || currentTab === 'review_queue' || currentTab === 'search' || currentTab === 'inspector'
              ? 'h-full flex flex-col min-h-0'
              : ''
          }`}>
            {currentTab === 'dashboard' && (
              <Dashboard
                documents={documents}
                onSelectDoc={handleInspectDoc}
                onOpenUpload={() => setIsUploadOpen(true)}
                onSwitchTab={setCurrentTab}
              />
            )}

            {currentTab === 'documents' && (
              <DocumentList
                documents={documents}
                onSelectDoc={handleInspectDoc}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}

            {currentTab === 'review_queue' && (
              <ReviewQueue
                documents={documents}
                onSelectDoc={handleInspectDoc}
              />
            )}

            {currentTab === 'cross_verification' && (
              <CrossVerification
                documents={documents}
                fastApiConfig={fastApiConfig}
                onToast={addToast}
              />
            )}

            {currentTab === 'search' && (
              <SearchPage
                documents={documents}
                onSelectDoc={handleInspectDoc}
              />
            )}

            {currentTab === 'inspector' && (
              <DocumentInspector
                document={selectedDoc}
                allDocuments={documents}
                onUpdateDoc={handleUpdateDocument}
                onReprocess={handleReprocessDoc}
                onBack={() => setCurrentTab('documents')}
                onToast={addToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadFiles={handleUploadFiles}
        onAddPreset={handleAddPreset}
      />

      <FastApiModal
        isOpen={isFastApiOpen}
        onClose={() => setIsFastApiOpen(false)}
        config={fastApiConfig}
        onSaveConfig={setFastApiConfig}
        onToast={addToast}
      />

      {/* Floating Notifications */}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  );
}
