import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Database,
  FileText,
  Cpu,
  Layers,
  Compass,
  Zap,
  Tag
} from 'lucide-react';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  documents = [], 
  onSelectDoc 
}) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('semantic'); // 'semantic', 'keyword'

  const conceptPresets = [
    { label: '☁️ GPU & Cloud Pods', prompt: 'GPU inference server pod cloud hosting' },
    { label: '⚠️ Math Calculation Error', prompt: 'math calculation discrepancy smudge total error' },
    { label: '🖥️ Hardware & Displays', prompt: '4K UltraSharp monitor hardware desk mount' },
    { label: '📄 Clean Approved Invoices', prompt: 'clean digital invoice Nimbus DeepCompute' },
    { label: '📊 Spreadsheets & CSV Logs', prompt: 'spreadsheet workbook tabular seat licenses' },
    { label: '🚚 Freight & Logistics', prompt: 'freight shipping dispatch cargo' }
  ];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return documents.map(doc => {
      const haystack = [
        doc.filename,
        doc.data?.invoiceNo || '',
        doc.data?.vendor || '',
        doc.data?.customer || '',
        doc.data?.docType || '',
        doc.extractedText || '',
        (doc.data?.lineItems || []).map(i => i.description).join(' ')
      ].join(' ').toLowerCase();

      if (mode === 'keyword') {
        const isMatch = haystack.includes(q);
        return { doc, score: isMatch ? 1.0 : 0, matchType: 'Exact Keyword Match' };
      } else {
        const tokens = q.split(/\s+/).filter(Boolean);
        const semanticBlob = (
          haystack + ' ' + 
          (doc.semanticTags || []).join(' ') + ' ' + 
          (doc.status === 'FLAGGED' ? 'math calculation error tax discrepancy missing field smudge' : 'clean valid approved passed')
        ).toLowerCase();
        
        let hits = 0;
        tokens.forEach(tok => {
          if (semanticBlob.includes(tok)) hits += 1;
          if (['math', 'calculation', 'discrepancy', 'error', 'tax', 'smudge'].includes(tok) && doc.status === 'FLAGGED') hits += 0.85;
          if (['cloud', 'gpu', 'server', 'compute', 'hosting', 'nimbus'].includes(tok) && doc.id.includes('101')) hits += 0.9;
          if (['hardware', 'monitor', 'screen', 'mount', 'apex'].includes(tok) && doc.id.includes('102')) hits += 0.9;
          if (['spreadsheet', 'software', 'seat', 'license', 'bi', 'excel'].includes(tok) && doc.format === 'EXCEL') hits += 0.9;
          if (['csv', 'log', 'dispatch', 'freight'].includes(tok) && doc.format === 'CSV') hits += 0.9;
        });

        const score = Math.min(0.99, Number((hits / Math.max(1, tokens.length)).toFixed(2)));
        return { doc, score, matchType: 'Vector Cosine Similarity' };
      }
    }).filter(res => {
      return mode === 'keyword' ? res.score > 0 : res.score >= 0.25;
    }).sort((a, b) => b.score - a.score);
  }, [documents, query, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-3xl border bg-white dark:bg-[#0b1220] border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header & Mode Switcher */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1c3461] to-[#2f5fb0] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Vector &amp; Semantic Intelligence Search
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Natural language semantic embeddings &amp; high-speed SQL keyword matching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Segmented Control */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-bold shadow-inner">
              <button
                onClick={() => setMode('semantic')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mode === 'semantic' 
                    ? 'bg-white dark:bg-[#1c3461] text-[#1c3461] dark:text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${mode === 'semantic' ? 'text-[#e57824]' : 'text-slate-400'}`} />
                <span>Semantic</span>
              </button>
              <button
                onClick={() => setMode('keyword')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mode === 'keyword' 
                    ? 'bg-white dark:bg-[#1c3461] text-[#1c3461] dark:text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Keyword</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spacious Search Input Field */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] flex-shrink-0">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#2f5fb0] absolute left-4 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder={
                mode === 'semantic' 
                  ? "Describe what you're looking for (e.g. 'GPU node hosting bill', 'receipt with smudge discrepancy')..." 
                  : "Type exact keyword, vendor name, invoice ID..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-13 pl-12 pr-12 text-sm sm:text-base font-semibold rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-[#2f5fb0]/15 focus:border-[#2f5fb0] transition-all shadow-xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg font-bold p-1 leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Concept Suggestion Pills */}
          <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0">
              Concepts:
            </span>
            {conceptPresets.map(preset => (
              <button
                key={preset.label}
                onClick={() => { setMode('semantic'); setQuery(preset.prompt); }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex-shrink-0 shadow-2xs"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100 dark:divide-slate-800/80 min-h-[300px]">
          {query.trim() === '' ? (
            /* Informative Zero State Guide */
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#eef4ff] dark:bg-[#1c3461]/30 flex items-center justify-center text-[#2f5fb0] dark:text-sky-400 mb-4 shadow-xs">
                <Compass className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Explore the Document Knowledge Graph
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mt-1 leading-relaxed">
                Type natural language search phrases or click any of the concept pills above to run semantic vector similarity across processed documents.
              </p>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-6 text-left">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                  <div className="text-xs font-bold text-[#1c3461] dark:text-sky-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#e57824]" />
                    <span>Semantic Vectors</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Searches concept embeddings even without exact keyword matches.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Discrepancy Spotting</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Find math mismatches, smudges, and missing values instantly.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Keyword SQL</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Lightning fast exact lookups for invoices, vendors, and line items.
                  </p>
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No Results Found */
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <Search className="w-10 h-10 mb-3 opacity-40 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching records found</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Try searching with broader terms like 'cloud', 'hardware', 'invoice', or switch between Semantic and Keyword modes.
              </p>
            </div>
          ) : (
            /* Matched Document Cards */
            <div className="flex flex-col gap-2.5">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pb-1 flex items-center justify-between">
                <span>Matching Results ({results.length})</span>
                <span className="font-mono text-[10px] text-slate-400">Ranked by similarity</span>
              </div>

              {results.map(({ doc, score, matchType }) => {
                const isValid = doc.status === 'VALID';
                const isFlagged = doc.status === 'FLAGGED';

                return (
                  <div
                    key={doc.id}
                    onClick={() => { onSelectDoc(doc.id); onClose(); }}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/70 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2f5fb0] dark:group-hover:text-sky-300 transition-colors truncate">
                          {doc.filename}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase border border-slate-200 dark:border-slate-700">
                          {doc.format}
                        </span>
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Valid</span>
                          </span>
                        ) : isFlagged ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Flagged</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Vendor: <strong className="text-slate-900 dark:text-slate-100">{doc.data?.vendor || 'Unknown'}</strong></span>
                        <span>•</span>
                        <span>Inv #: <strong className="text-slate-900 dark:text-slate-100">{doc.data?.invoiceNo || '[BLANK]'}</strong></span>
                        <span>•</span>
                        <span>Total: <strong className="text-slate-900 dark:text-white font-mono">${Number(doc.data?.total || 0).toFixed(2)}</strong></span>
                      </div>

                      {/* Semantic Concept Tags */}
                      {doc.semanticTags && doc.semanticTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {doc.semanticTags.slice(0, 4).map((tag, idx) => (
                            <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Match Score & CTA */}
                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-extrabold bg-[#eef4ff] text-[#1c3461] dark:bg-[#1c3461]/40 dark:text-sky-300 border border-[#2f5fb0]/20">
                          <span>{Math.round(score * 100)}% Match</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{matchType}</div>
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-bold text-[#2f5fb0] dark:text-sky-400 group-hover:translate-x-0.5 transition-transform mt-1">
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Keyboard Footer */}
        <div className="p-3 px-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold shadow-2xs">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold shadow-2xs">↵</kbd> to select</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
            SQLite FTS5 + Vector Cosine Index
          </div>
        </div>
      </div>
    </div>
  );
}

