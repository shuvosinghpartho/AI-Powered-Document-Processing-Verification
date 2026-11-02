import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers 
} from 'lucide-react';

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onUploadFiles, 
  onAddPreset,
  uploadingDocs = []
}) {
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-7 shadow-2xl flex flex-col gap-5 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload Documents &amp; Ingest Pipeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supports Digital PDF, Vision Scans (PNG/JPG), Excel (.xlsx), and CSV files.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            onUploadFiles(e.dataTransfer.files);
          }}
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-950/50'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Drag &amp; Drop multiple files here
            </div>
            <div className="text-xs text-slate-400 mt-1">
              or click below to browse from your computer
            </div>
          </div>

          <label className="cursor-pointer mt-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all">
            <span>Browse Files</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onUploadFiles(e.target.files)}
            />
          </label>
        </div>

        {/* Test Document Presets */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Instant Demo Presets (No local file needed):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => { onAddPreset('test_invoices_batch'); onClose(); }}
              className="p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-left hover:border-indigo-500 transition-colors col-span-1 sm:col-span-3 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Execute EasyOCR Batch on test-invoices/ (All 6 Images)</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct Optical Character Recognition on invoice.png, invoice-2.png, invoice-3.png, invoice-4.png, invoice-5.png, invoice-6.jpg
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm">
                Run EasyOCR
              </span>
            </button>

            <button
              onClick={() => { onAddPreset('flagged_math'); onClose(); }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors"
            >
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Scan Receipt</div>
              <div className="text-[10px] text-amber-500 font-mono">Math discrepancy test</div>
            </button>

            <button
              onClick={() => { onAddPreset('flagged_missing'); onClose(); }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-rose-400 dark:hover:border-rose-500/50 transition-colors"
            >
              <div className="text-xs font-semibold text-slate-900 dark:text-white">CSV Logistics</div>
              <div className="text-[10px] text-rose-500 font-mono">Missing Invoice# test</div>
            </button>

            <button
              onClick={() => { onAddPreset('clean_pdf'); onClose(); }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-colors"
            >
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Digital Cloud PDF</div>
              <div className="text-[10px] text-emerald-500 font-mono">100% verified test</div>
            </button>
          </div>
        </div>

        {/* 5-Stage Pipeline Status Info */}
        <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>5-Stage Processing: Input → Vision OCR → Gemini 2.5 → Rule Verification → Store</span>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

