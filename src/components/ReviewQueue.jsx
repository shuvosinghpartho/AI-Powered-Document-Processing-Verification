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
    <div className="flex flex-col gap-6 pb-12">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Human-in-the-Loop Review Queue
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Documents that failed deterministic validation rules. Inspect values, correct OCR smudges, and commit.
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {flaggedDocs.length}
          </div>
          <div className="text-xs text-slate-400 font-medium">Pending Review</div>
        </div>
      </div>

      {/* Main Review List */}
      <div className="rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {flaggedDocs.length === 0 ? (
          <div className="p-16 text-center text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold">Zero Documents Flagged!</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              All processed records have successfully passed numeric calculation, mandatory metadata, and duplicate checks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Document Details</th>
                  <th className="py-4 px-6">Invoice #</th>
                  <th className="py-4 px-6">Vendor Entity</th>
                  <th className="py-4 px-6 text-right">Recorded Total</th>
                  <th className="py-4 px-6">Validation Discrepancies</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {flaggedDocs.map(doc => {
                  const val = runValidationRules(doc, documents);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-5 px-6 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{doc.filename}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                            {doc.format}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {doc.engine} • Confidence: {doc.ocrConfidence}%
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        {doc.data?.invoiceNo ? (
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{doc.data.invoiceNo}</span>
                        ) : (
                          <span className="text-rose-500 font-bold">[MISSING / BLANK]</span>
                        )}
                      </td>

                      <td className="py-5 px-6 font-sans text-slate-700 dark:text-slate-300">
                        {doc.data?.vendor || '—'}
                      </td>

                      <td className="py-5 px-6 text-right font-bold text-slate-900 dark:text-white">
                        ${Number(doc.data?.total || 0).toFixed(2)}
                      </td>

                      <td className="py-5 px-6 font-sans text-xs">
                        <ul className="space-y-1">
                          {val.errors.map((err, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                              <span>{err}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="py-5 px-6 text-right font-sans">
                        <button
                          onClick={() => onSelectDoc(doc.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all inline-flex items-center gap-1.5"
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

