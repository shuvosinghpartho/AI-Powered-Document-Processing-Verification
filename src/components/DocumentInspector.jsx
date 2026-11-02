import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Copy, 
  Eye, 
  Code, 
  Layers, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react';
import { runValidationRules } from '../data/mockDocuments.js';

export default function DocumentInspector({ 
  document: doc, 
  allDocuments = [],
  onUpdateDoc, 
  onReprocess, 
  onBack,
  onToast 
}) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'ocr', 'json', 'audit'
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [highlightedField, setHighlightedField] = useState(null);

  if (!doc) {
    return (
      <div className="p-12 text-center text-slate-400 border border-dashed rounded-3xl">
        No document selected.
      </div>
    );
  }

  // Calculate live validation for current document
  const validation = runValidationRules(doc, allDocuments);

  const handleFieldChange = (field, val) => {
    const updated = {
      ...doc,
      data: {
        ...doc.data,
        [field]: val
      }
    };
    onUpdateDoc(updated);
  };

  const handleLineItemChange = (idx, field, val) => {
    const updatedItems = [...(doc.data?.lineItems || [])];
    updatedItems[idx] = {
      ...updatedItems[idx],
      [field]: field === 'qty' || field === 'unitPrice' ? Number(val) : val
    };

    const newSubtotal = updatedItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
    const tax = Number(doc.data?.tax) || 0;

    const updated = {
      ...doc,
      data: {
        ...doc.data,
        lineItems: updatedItems,
        subtotal: Number(newSubtotal.toFixed(2)),
        total: Number((newSubtotal + tax).toFixed(2))
      }
    };
    onUpdateDoc(updated);
  };

  const handleAddLineItem = () => {
    const updatedItems = [...(doc.data?.lineItems || []), { description: 'New Service Line', qty: 1, unitPrice: 120.00 }];
    const newSubtotal = updatedItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
    const tax = Number(doc.data?.tax) || 0;

    const updated = {
      ...doc,
      data: {
        ...doc.data,
        lineItems: updatedItems,
        subtotal: Number(newSubtotal.toFixed(2)),
        total: Number((newSubtotal + tax).toFixed(2))
      }
    };
    onUpdateDoc(updated);
    onToast('Added line item. Subtotal recalculated.', 'info');
  };

  const handleRemoveLineItem = (idx) => {
    const updatedItems = (doc.data?.lineItems || []).filter((_, i) => i !== idx);
    const newSubtotal = updatedItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
    const tax = Number(doc.data?.tax) || 0;

    const updated = {
      ...doc,
      data: {
        ...doc.data,
        lineItems: updatedItems,
        subtotal: Number(newSubtotal.toFixed(2)),
        total: Number((newSubtotal + tax).toFixed(2))
      }
    };
    onUpdateDoc(updated);
  };

  const handleAutoFixMath = () => {
    const correctTotal = Number(((Number(doc.data?.subtotal) || 0) + (Number(doc.data?.tax) || 0)).toFixed(2));
    const updated = {
      ...doc,
      data: {
        ...doc.data,
        total: correctTotal
      }
    };
    onUpdateDoc(updated);
    onToast(`Corrected Total to $${correctTotal.toFixed(2)} (Subtotal + Tax)`, 'success');
  };

  const handleAutoFixMissingInvoice = () => {
    const synthesized = `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = {
      ...doc,
      data: {
        ...doc.data,
        invoiceNo: synthesized
      }
    };
    onUpdateDoc(updated);
    onToast(`Assigned synthesized invoice #${synthesized}`, 'success');
  };

  const handleApprove = () => {
    const val = runValidationRules(doc, allDocuments);
    const updated = {
      ...doc,
      status: val.status,
      history: [
        ...(doc.history || []),
        {
          time: new Date().toLocaleTimeString(),
          stage: 'Human-in-the-Loop Verification',
          engine: 'Human Operator',
          detail: val.passed ? 'Marked valid and confirmed into SQLite' : 'Saved manual edits with remaining flags'
        }
      ]
    };
    onUpdateDoc(updated);
    if (val.passed) {
      onToast(`Document ${doc.filename} verified & marked VALID!`, 'success');
    } else {
      onToast(`Saved changes. Notice: document still has validation warnings.`, 'warning');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast(`Copied ${label} to clipboard`, 'success');
    });
  };

  const exportJson = () => {
    const payload = JSON.stringify(doc, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.filename}_extracted.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onToast(`Exported ${doc.filename} JSON`, 'success');
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {doc.filename}
              </h2>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {doc.format}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-mono">
              <span>Engine: <strong className="text-slate-700 dark:text-slate-200">{doc.engine}</strong></span>
              <span>•</span>
              <span>Confidence: <strong className="text-indigo-500">{doc.ocrConfidence}%</strong></span>
              <span>•</span>
              <span>{doc.sizeKb} KB</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onReprocess(doc.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reprocess AI</span>
          </button>

          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleApprove}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
              validation.passed 
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve &amp; Commit</span>
          </button>
        </div>
      </div>

      {/* Main Spacious Dual Split Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Visual Document & Raw Data (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Subtabs */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center gap-1">
              {[
                { id: 'preview', label: 'Visual Preview', icon: Eye },
                { id: 'ocr', label: 'Raw OCR', icon: Code },
                { id: 'json', label: 'Gemini JSON', icon: Sparkles },
                { id: 'audit', label: 'Audit Log', icon: Layers },
              ].map(tab => {
                const Icon = tab.icon;
                const isTabActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all ${
                      isTabActive
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'preview' && (
              <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>BBoxes</span>
              </label>
            )}
          </div>

          {/* Subtab Contents */}
          <div className="p-6">
            {activeTab === 'preview' && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col gap-5 font-mono text-xs shadow-inner">
                {/* Header inside Document Visualizer */}
                <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-300 dark:border-slate-800">
                  <div>
                    <div 
                      className={`font-bold text-sm text-slate-900 dark:text-white ${showBoundingBoxes ? 'ocr-bbox ocr-bbox-blue' : ''}`}
                      onMouseEnter={() => setHighlightedField('vendor')}
                      onMouseLeave={() => setHighlightedField(null)}
                    >
                      {doc.data?.vendor || '[VENDOR NOT DETECTED]'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">Enterprise Document Services</div>
                  </div>
                  <div className="text-right">
                    <div 
                      className={`font-bold text-slate-900 dark:text-white ${showBoundingBoxes ? 'ocr-bbox ocr-bbox-green' : ''}`}
                      onMouseEnter={() => setHighlightedField('invoiceNo')}
                      onMouseLeave={() => setHighlightedField(null)}
                    >
                      {doc.data?.invoiceNo || '[MISSING INVOICE NUMBER]'}
                    </div>
                    <div 
                      className={`text-[11px] text-slate-400 mt-0.5 ${showBoundingBoxes ? 'ocr-bbox ocr-bbox-purple' : ''}`}
                      onMouseEnter={() => setHighlightedField('issueDate')}
                      onMouseLeave={() => setHighlightedField(null)}
                    >
                      {doc.data?.issueDate || 'YYYY-MM-DD'}
                    </div>
                  </div>
                </div>

                {/* Table representation */}
                <div className="py-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-300 dark:border-slate-800 text-[10px] text-slate-400 font-sans uppercase">
                        <th className="pb-2">Line Description</th>
                        <th className="pb-2 text-right">Qty</th>
                        <th className="pb-2 text-right">Rate</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                      {(doc.data?.lineItems || []).map((item, i) => (
                        <tr key={i} className={showBoundingBoxes ? 'ocr-bbox ocr-bbox-purple' : ''}>
                          <td className="py-2.5 text-slate-800 dark:text-slate-200">{item.description}</td>
                          <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{item.qty}</td>
                          <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">${Number(item.unitPrice).toFixed(2)}</td>
                          <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                            ${((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Strip */}
                <div className="pt-4 border-t border-dashed border-slate-300 dark:border-slate-800 flex justify-end">
                  <div className="w-56 flex flex-col gap-1.5 text-right text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${Number(doc.data?.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tax / VAT:</span>
                      <span className="font-semibold">${Number(doc.data?.tax || 0).toFixed(2)}</span>
                    </div>
                    <div 
                      className={`flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-300 dark:border-slate-800 ${showBoundingBoxes ? 'ocr-bbox ocr-bbox-amber' : ''}`}
                      onMouseEnter={() => setHighlightedField('total')}
                      onMouseLeave={() => setHighlightedField(null)}
                    >
                      <span>Total Due:</span>
                      <span>${Number(doc.data?.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ocr' && (
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(doc.extractedText, 'Raw OCR')}
                  className="absolute right-3 top-3 px-2 py-1 text-[11px] font-semibold rounded bg-slate-800 text-slate-200 flex items-center gap-1 hover:bg-slate-700"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[460px]">
                  {doc.extractedText}
                </pre>
              </div>
            )}

            {activeTab === 'json' && (
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(doc.data, null, 2), 'JSON')}
                  className="absolute right-3 top-3 px-2 py-1 text-[11px] font-semibold rounded bg-slate-800 text-slate-200 flex items-center gap-1 hover:bg-slate-700"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[460px]">
                  {JSON.stringify({
                    extraction_model: 'gemini-2.5-flash',
                    doc_id: doc.id,
                    filename: doc.filename,
                    status: validation.status,
                    entities: doc.data,
                    validation_summary: validation
                  }, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2.5">Time</th>
                      <th className="py-2.5">Stage</th>
                      <th className="py-2.5">Engine</th>
                      <th className="py-2.5">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(doc.history || []).map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="py-2.5 text-slate-400">{h.time}</td>
                        <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{h.stage}</td>
                        <td className="py-2.5 text-indigo-500">{h.engine}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400 font-sans">{h.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Human-in-the-Loop Structured Form (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
          
          {/* Header & Validation Alerts */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Extracted Entities &amp; Manual Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Live verification checks update instantly as you edit values.
                </p>
              </div>

              <div>
                {validation.passed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>VALIDATION PASSED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>FLAGGED ({validation.errors.length} Issues)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Error Banner with Smart 1-Click Fixes */}
            {!validation.passed && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Discrepancies Detected by Rule Engine:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-rose-700 dark:text-rose-300">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/60">
                  {validation.errors.some(e => e.includes('Math Mismatch') || e.includes('Line items sum')) && (
                    <button
                      onClick={handleAutoFixMath}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Fix Math Total (Subtotal + Tax)</span>
                    </button>
                  )}

                  {validation.errors.some(e => e.includes('Missing Required Fields')) && (
                    <button
                      onClick={handleAutoFixMissingInvoice}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Synthesize Invoice #</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Spacious Editable Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Classification
              </label>
              <select
                value={doc.data?.docType || 'Invoice'}
                onChange={(e) => handleFieldChange('docType', e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Invoice">Invoice</option>
                <option value="Receipt">Receipt</option>
                <option value="Purchase Order">Purchase Order</option>
                <option value="Expense Log">Expense Log</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Invoice / Ref #</span>
                {!doc.data?.invoiceNo && <span className="text-[10px] text-rose-500 font-bold uppercase">Required</span>}
              </label>
              <input
                type="text"
                value={doc.data?.invoiceNo || ''}
                onChange={(e) => handleFieldChange('invoiceNo', e.target.value)}
                placeholder="e.g. INV-2026-9901"
                className={`w-full h-10 px-3 text-xs font-mono rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  !doc.data?.invoiceNo ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Vendor Entity</span>
                {!doc.data?.vendor && <span className="text-[10px] text-rose-500 font-bold uppercase">Required</span>}
              </label>
              <input
                type="text"
                value={doc.data?.vendor || ''}
                onChange={(e) => handleFieldChange('vendor', e.target.value)}
                placeholder="Vendor Name"
                className={`w-full h-10 px-3 text-xs rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  !doc.data?.vendor ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Customer / Client
              </label>
              <input
                type="text"
                value={doc.data?.customer || ''}
                onChange={(e) => handleFieldChange('customer', e.target.value)}
                placeholder="Customer or Buyer Name"
                className="w-full h-10 px-3 text-xs rounded-xl border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Date
              </label>
              <input
                type="date"
                value={doc.data?.issueDate || ''}
                onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                className="w-full h-10 px-3 text-xs font-mono rounded-xl border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Currency
              </label>
              <select
                value={doc.data?.currency || 'USD'}
                onChange={(e) => handleFieldChange('currency', e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Recorded Total</span>
                <button onClick={handleAutoFixMath} className="text-[10px] text-indigo-500 hover:underline">
                  Recalc Sub+Tax
                </button>
              </label>
              <input
                type="number"
                step="0.01"
                value={doc.data?.total !== undefined ? doc.data?.total : ''}
                onChange={(e) => handleFieldChange('total', Number(e.target.value))}
                className={`w-full h-10 px-3 text-xs font-mono font-bold rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  validation.errors.some(e => e.includes('Math Mismatch'))
                    ? 'border-rose-500 ring-1 ring-rose-500 text-rose-600'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                }`}
              />
            </div>
          </div>

          {/* Line Items Table with Add/Remove */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Extracted Line Items ({doc.data?.lineItems?.length || 0})
              </h4>
              <button
                onClick={handleAddLineItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 w-20 text-right">Qty</th>
                    <th className="py-3 px-4 w-28 text-right">Unit Price</th>
                    <th className="py-3 px-4 w-28 text-right">Line Total</th>
                    <th className="py-3 px-4 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {(doc.data?.lineItems || []).map((item, idx) => {
                    const lineTotal = ((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)).toFixed(2);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none font-sans text-xs text-slate-800 dark:text-slate-200"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleLineItemChange(idx, 'qty', e.target.value)}
                            className="w-16 text-right bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none text-xs text-slate-700 dark:text-slate-300"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-24 text-right bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none text-xs text-slate-700 dark:text-slate-300"
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ${lineTotal}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Subtotal & Tax strip */}
            <div className="mt-4 flex flex-wrap justify-end gap-6 text-xs font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span>Sum of Lines:</span>
                <strong className="text-slate-900 dark:text-white">${Number(doc.data?.subtotal || 0).toFixed(2)}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span>Tax Amount:</span>
                <input
                  type="number"
                  step="0.01"
                  value={doc.data?.tax !== undefined ? doc.data?.tax : ''}
                  onChange={(e) => {
                    const newTax = Number(e.target.value);
                    const currentSub = Number(doc.data?.subtotal || 0);
                    onUpdateDoc({
                      ...doc,
                      data: {
                        ...doc.data,
                        tax: newTax,
                        total: Number((currentSub + newTax).toFixed(2))
                      }
                    });
                  }}
                  className="w-20 text-right border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-950 font-bold"
                />
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <span>Final Total:</span>
                <span className="text-sm font-bold text-indigo-500">${Number(doc.data?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

