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
      
      {/* Header & Filter Controls Bar (Spacious, Beautiful SaaS Controls) */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-shrink-0">
        
        {/* Search Input with high visibility & clear button */}
        <div className="relative flex-1 min-w-[280px] max-w-lg">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by name, vendor, or invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-10 text-xs sm:text-sm font-medium rounded-xl border bg-slate-50/80 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#2f5fb0] focus:border-transparent transition-all shadow-xs"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-base font-bold p-1 leading-none"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters and CTA Group */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Format Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Format:</span>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="h-11 px-3.5 text-xs font-semibold rounded-xl border bg-slate-50/80 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2f5fb0] transition-all cursor-pointer shadow-xs"
            >
              <option value="ALL">All Formats</option>
              <option value="PDF">PDF Documents</option>
              <option value="IMAGE">Image Scans (Vision)</option>
              <option value="EXCEL">Excel Spreadsheets</option>
              <option value="CSV">CSV Delimited</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3.5 text-xs font-semibold rounded-xl border bg-slate-50/80 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2f5fb0] transition-all cursor-pointer shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="VALID">✓ Validated (Clean)</option>
              <option value="FLAGGED">⚠ Flagged for Review</option>
              <option value="PROCESSING">⏳ Processing</option>
            </select>
          </div>

          {/* Upload New CTA */}
          <button
            onClick={onOpenUpload}
            className="h-11 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#1c3461] to-[#2f5fb0] hover:from-[#16294d] hover:to-[#264c8d] text-white flex items-center gap-2 shadow-md shadow-[#1c3461]/25 hover:shadow-lg hover:shadow-[#1c3461]/35 transition-all ml-auto active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-300 stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main Repository Table (Single Window Card with Internal Scroll) */}
      <div className="flex-1 min-h-0 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
            No matching documents found in repository.
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-[#0c1322]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider shadow-xs">
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
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
                {filteredDocs.map(doc => {
                  const isValid = doc.status === 'VALID';
                  const isFlagged = doc.status === 'FLAGGED';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{doc.filename}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold uppercase">
                            {doc.format}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 font-medium">
                          {doc.sizeKb} KB • {doc.engine}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-sans text-slate-800 dark:text-slate-200 font-semibold">
                        {doc.data?.docType || 'Document'}
                      </td>

                      <td className="py-3.5 px-5">
                        {doc.data?.invoiceNo ? (
                          <span className="font-bold text-slate-900 dark:text-slate-100">{doc.data.invoiceNo}</span>
                        ) : (
                          <span className="text-rose-600 font-extrabold">[BLANK]</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 font-sans text-slate-900 dark:text-slate-100">
                        <div className="font-bold">{doc.data?.vendor || '—'}</div>
                        {doc.data?.customer && (
                          <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">To: {doc.data.customer}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right font-extrabold text-slate-900 dark:text-white">
                        ${Number(doc.data?.total || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[#1c3461] dark:text-sky-400 font-bold">{doc.ocrConfidence}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-center font-sans">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>VALID</span>
                          </span>
                        ) : isFlagged ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>FLAGGED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{doc.progress}%</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right font-sans">
                        <button
                          onClick={() => onSelectDoc(doc.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5 shadow-xs active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
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
      </div>
    </div>
  );
}

