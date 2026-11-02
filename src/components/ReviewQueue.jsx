import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';
import { runValidationRules } from '../data/mockDocuments.js';

export default function ReviewQueue({ 
  documents = [], 
  onSelectDoc 
}) {
  const flaggedDocs = documents.filter(d => d.status === 'FLAGGED');

  return (
    <div className="flex flex-col h-full min-h-0 gap-3.5">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/20 border border-rose-300/80 dark:border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Human-in-the-Loop Review Queue
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
              Documents requiring manual inspection for calculation variances, missing headers, or duplicate invoices.
            </p>
          </div>
        </div>

        <div className="text-right flex items-center sm:flex-col gap-2 sm:gap-0">
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
            {flaggedDocs.length}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">Pending Review</div>
        </div>
      </div>

      {/* Main Review List (Single Window Card with Internal Scroll) */}
      <div className="flex-1 min-h-0 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {flaggedDocs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-emerald-600 dark:text-emerald-400 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Zero Documents Flagged!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm font-medium">
              All processed records have successfully passed numeric calculation, mandatory metadata, and duplicate checks.
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs text-left">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-[#0c1322]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider shadow-xs">
                <tr>
                  <th className="py-3.5 px-5">Document Details</th>
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-5">Vendor Entity</th>
                  <th className="py-3.5 px-5 text-right">Recorded Total</th>
                  <th className="py-3.5 px-5">Validation Discrepancies</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
                {flaggedDocs.map(doc => {
                  const val = runValidationRules(doc, documents);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{doc.filename}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold uppercase">
                            {doc.format}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 font-medium">
                          {doc.engine} • Confidence: {doc.ocrConfidence}%
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {doc.data?.invoiceNo ? (
                          <span className="text-slate-900 dark:text-slate-100 font-bold">{doc.data.invoiceNo}</span>
                        ) : (
                          <span className="text-rose-600 font-extrabold">[MISSING / BLANK]</span>
                        )}
                      </td>

                      <td className="py-4 px-5 font-sans text-slate-900 dark:text-slate-100 font-bold">
                        {doc.data?.vendor || '—'}
                      </td>

                      <td className="py-4 px-5 text-right font-extrabold text-slate-900 dark:text-white">
                        ${Number(doc.data?.total || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-5 font-sans text-xs">
                        <ul className="space-y-1">
                          {val.errors.map((err, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                              <span>{err}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="py-4 px-5 text-right font-sans">
                        <button
                          onClick={() => onSelectDoc(doc.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 shadow-sm shadow-rose-600/30 transition-all inline-flex items-center gap-1.5 active:scale-95"
                        >
                          <span>Review &amp; Fix</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

