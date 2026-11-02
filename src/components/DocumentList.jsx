import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Download, 
  Plus, 
  ArrowUpDown 
} from 'lucide-react';

export default function DocumentList({ 
  documents = [], 
  onSelectDoc, 
  onOpenUpload 
}) {
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      if (formatFilter !== 'ALL' && doc.format !== formatFilter) return false;
      if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const haystack = [
        doc.filename,
        doc.data?.invoiceNo || '',
        doc.data?.vendor || '',
        doc.extractedText || ''
      ].join(' ').toLowerCase();

      return haystack.includes(q);
    });
  }, [documents, search, formatFilter, statusFilter]);

  return (
    <div className="flex flex-col h-full min-h-0 gap-3.5">
      
      {/* Header & Filter Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-shrink-0">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search repository by filename, vendor, invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9.5 pl-10 pr-4 text-xs rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2f5fb0]"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Format:</span>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="h-9.5 px-3 text-xs rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2f5fb0]"
            >
              <option value="ALL">All Formats</option>
              <option value="PDF">PDF</option>
              <option value="IMAGE">Image Vision</option>
              <option value="EXCEL">Excel XLSX</option>
              <option value="CSV">CSV Delimited</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9.5 px-3 text-xs rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2f5fb0]"
            >
              <option value="ALL">All Statuses</option>
              <option value="VALID">Validated Only</option>
              <option value="FLAGGED">Flagged for Review</option>
              <option value="PROCESSING">In Processing</option>
            </select>
          </div>

          <button
            onClick={onOpenUpload}
            className="h-9.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#1c3461] to-[#2f5fb0] hover:from-[#16294d] hover:to-[#264c8d] text-white flex items-center gap-1.5 shadow-sm shadow-[#1c3461]/25 transition-all ml-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* Main Repository Table (Single Window Card with Internal Scroll) */}
      <div className="flex-1 min-h-0 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            No matching documents found in repository.
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-[#0c1322]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider shadow-sm">
                <tr>
                  <th className="py-3.5 px-5">Document Name</th>
                  <th className="py-3.5 px-5">Classification</th>
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-5">Vendor Entity</th>
                  <th className="py-3.5 px-5 text-right">Extracted Total</th>
                  <th className="py-3.5 px-5 text-center">Confidence</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                {filteredDocs.map(doc => {
                  const isValid = doc.status === 'VALID';
                  const isFlagged = doc.status === 'FLAGGED';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-sans">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{doc.filename}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                            {doc.format}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {doc.sizeKb} KB • {doc.engine}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-sans text-slate-700 dark:text-slate-300">
                        {doc.data?.docType || 'Document'}
                      </td>

                      <td className="py-3.5 px-5">
                        {doc.data?.invoiceNo ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.data.invoiceNo}</span>
                        ) : (
                          <span className="text-rose-500 font-bold">[BLANK]</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 font-sans text-slate-700 dark:text-slate-300">
                        <div className="font-medium">{doc.data?.vendor || '—'}</div>
                        {doc.data?.customer && (
                          <div className="text-[10px] text-slate-400">To: {doc.data.customer}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right font-bold text-slate-900 dark:text-white">
                        ${Number(doc.data?.total || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[#2f5fb0] dark:text-sky-400 font-semibold">{doc.ocrConfidence}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-center font-sans">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>VALID</span>
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

                      <td className="py-3.5 px-5 text-right font-sans">
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
        )}

        {/* Single Window Sticky Footer Summary */}
        <div className="py-2.5 px-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Showing <strong className="text-slate-800 dark:text-slate-200">{filteredDocs.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{documents.length}</strong> repository records</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Single-Window Mode &bull; Mouse scroll inside table
          </div>
        </div>
      </div>
    </div>
  );
}

