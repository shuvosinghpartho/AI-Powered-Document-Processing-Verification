import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  Eye, 
  Clock, 
  UploadCloud 
} from 'lucide-react';
import { VolumeTrendChart, FormatDonutChart, ValidationHealthBar } from './Charts.jsx';
import { WEEKLY_PROCESSING_STATS, FORMAT_DISTRIBUTION } from '../data/mockDocuments.js';

export default function Dashboard({ 
  documents = [], 
  onSelectDoc, 
  onOpenUpload,
  onSwitchTab
}) {
  const total = documents.length;
  const valid = documents.filter(d => d.status === 'VALID').length;
  const flagged = documents.filter(d => d.status === 'FLAGGED').length;
  const processing = documents.filter(d => d.status === 'PROCESSING').length;
  const validRate = total > 0 ? Math.round((valid / total) * 100) : 0;
  
  const avgConfidence = total > 0 
    ? (documents.reduce((acc, d) => acc + (d.ocrConfidence || 0), 0) / total).toFixed(1)
    : 0;

  const totalValue = documents.reduce((acc, d) => acc + (Number(d.data?.total) || 0), 0);

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c3461] via-[#162a50] to-[#0c172d] border border-[#2f5fb0]/40 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff4d6] text-[#d06a16] border border-[#e57824]/30 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#e57824]" />
            <span className="font-sans font-bold">Cottage Care Intelligent Platform</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            AI-Powered Document Processing &amp; Financial Reconciliation
          </h2>
          <p className="text-xs sm:text-sm text-slate-200/90 mt-2 leading-relaxed">
            Autonomous ingestion pipeline with PyMuPDF, EasyOCR vision models, Gemini 3.5 Flash Lite entity parsing, deterministic 4-rule validation, and PDF-Excel cross-verification.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenUpload}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#e57824] to-[#f28c28] hover:from-[#d06a16] hover:to-[#e57824] shadow-lg shadow-[#e57824]/30 transition-all hover:scale-[1.02] w-full sm:w-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
          
          <button
            onClick={() => onSwitchTab('review_queue')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all backdrop-blur-sm w-full sm:w-auto"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>Review Queue ({flagged})</span>
          </button>
        </div>

        {/* Ambient Decorative Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Documents</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#2f5fb0] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{total}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% from last week</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Validation Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{validRate}%</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {valid} of {total} passed deterministic checks
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Requires Attention</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">{flagged}</div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
              Human-in-the-Loop review needed
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Value Processed</span>
            <div className="w-9 h-9 rounded-xl bg-[#2f5fb0]/10 text-[#2f5fb0] flex items-center justify-center">
              <span className="font-mono font-bold text-xs">$</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-mono font-medium">
              Avg OCR Confidence: {avgConfidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SaaS Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Velocity & Trend (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <VolumeTrendChart data={WEEKLY_PROCESSING_STATS} />
          
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Peak throughput: <strong>95 documents/day</strong></span>
            <span className="font-mono text-indigo-500 font-semibold">Gemini 2.5 Flash</span>
          </div>
        </div>

        {/* Right Charts: Format Distribution & Health (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm">
            <FormatDonutChart data={FORMAT_DISTRIBUTION} />
          </div>

          <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm">
            <ValidationHealthBar 
              validCount={valid} 
              flaggedCount={flagged} 
              processingCount={processing} 
            />
          </div>
        </div>
      </div>

      {/* Recent Ingestion Stream Table */}
      <div className="rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Documents Stream</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Real-time status of ingested invoices &amp; records</p>
          </div>
          
          <button
            onClick={() => onSwitchTab('documents')}
            className="text-xs font-bold text-[#1c3461] hover:text-[#2f5fb0] dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>View All Repository</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs text-left">
            <thead className="bg-slate-100/90 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Document Details</th>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Vendor Entity</th>
                <th className="py-3.5 px-6 text-right">Extracted Total</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {documents.slice(0, 5).map(doc => {
                const isValid = doc.status === 'VALID';
                const isFlagged = doc.status === 'FLAGGED';

                return (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{doc.filename}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                          {doc.format}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                        <span>{doc.engine}</span>
                        <span>•</span>
                        <span>{doc.sizeKb} KB</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {doc.data?.invoiceNo ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.data.invoiceNo}</span>
                      ) : (
                        <span className="text-rose-500 font-bold">[BLANK]</span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-sans text-slate-700 dark:text-slate-300">
                      {doc.data?.vendor || '—'}
                    </td>

                    <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">
                      ${Number(doc.data?.total || 0).toFixed(2)}
                    </td>

                    <td className="py-4 px-6 text-center font-sans">
                      {isValid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>VALIDATED</span>
                        </span>
                      ) : isFlagged ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span>FLAGGED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{doc.progress}%</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right font-sans">
                      <button
                        onClick={() => onSelectDoc(doc.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

