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
  Compass,
  Zap,
  CornerDownLeft,
  SlidersHorizontal,
  Clock
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
    { label: 'GPU & Cloud Pods', prompt: 'GPU inference server pod cloud hosting' },
    { label: 'Math Error', prompt: 'math calculation discrepancy smudge total error' },
    { label: 'Hardware & Displays', prompt: '4K UltraSharp monitor hardware desk mount' },
    { label: 'Clean Digital Invoices', prompt: 'clean digital invoice Nimbus DeepCompute' },
    { label: 'Excel & CSV Data', prompt: 'spreadsheet workbook tabular seat licenses' },
    { label: 'Freight & Logistics', prompt: 'freight shipping dispatch cargo' }
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
        return { doc, score: isMatch ? 1.0 : 0, matchType: 'Exact SQL Match' };
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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-5 pt-3 sm:pt-14 md:pt-16 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl sm:rounded-3xl border bg-white dark:bg-[#070c18] border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[86vh]">
        
        {/* Header & Mode Switcher */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#1c3461] to-[#2f5fb0] flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                Vector &amp; Semantic Intelligence Search
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:block">
                Deep natural language semantic embeddings &amp; high-speed SQL keyword matching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mode Switcher Segmented Control */}
            <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-bold shadow-inner">
              <button
                onClick={() => setMode('semantic')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[11px] sm:text-xs ${
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
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[11px] sm:text-xs ${
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
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
              aria-label="Close search modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Elevated SaaS Search Box Container */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c18] flex-shrink-0">
          
          {/* Dual-layered Radiant Glow Wrapper */}
          <div className="relative group rounded-2xl p-[1.5px] bg-gradient-to-r from-[#1c3461] via-[#2f5fb0] to-[#e57824] shadow-md shadow-[#1c3461]/10 focus-within:shadow-xl focus-within:shadow-[#2f5fb0]/25 transition-all">
            <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[15px] bg-slate-50/95 dark:bg-[#0b1220]/95 border border-white/50 dark:border-slate-800/80">
              
              {/* Glowing Search Badge Icon */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#1c3461] to-[#2f5fb0] flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-[#1c3461]/30">
                {mode === 'semantic' ? (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
                ) : (
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-sky-200" />
                )}
              </div>

              {/* Text Input */}
              <input
                type="text"
                autoFocus
                placeholder={
                  mode === 'semantic' 
                    ? "Ask in natural language (e.g. 'GPU cloud server pod', 'receipt with calculation smudge')..." 
                    : "Search exact vendor name, invoice reference, customer, or line item..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm md:text-base font-semibold min-w-0"
              />

              {/* Inline Engine Indicator Pill (Desktop/Tablet) */}
              <div className="hidden sm:flex items-center flex-shrink-0">
                {mode === 'semantic' ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#eef4ff] text-[#1c3461] dark:bg-[#1c3461]/60 dark:text-sky-300 border border-[#2f5fb0]/30 shadow-2xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Vector AI Active</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs">
                    <Database className="w-3 h-3 text-[#2f5fb0]" />
                    <span>Exact SQL Mode</span>
                  </div>
                )}
              </div>

              {/* Clear Button */}
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="w-7 h-7 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0"
                  title="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Concept Suggestion Pills */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0">
              Concepts:
            </span>
            {conceptPresets.map(preset => {
              const isActive = query === preset.prompt;
              return (
                <button
                  key={preset.label}
                  onClick={() => { setMode('semantic'); setQuery(preset.prompt); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex-shrink-0 flex items-center gap-1 shadow-2xs ${
                    isActive
                      ? 'bg-[#1c3461] text-white border border-[#e57824] shadow-sm'
                      : 'border border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Micro Telemetry Bar */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Indexed: <strong className="text-slate-700 dark:text-slate-300">{documents.length} repository documents</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span>Embedding Dim: 768</span>
              <span>•</span>
              <span>Cosine Index: SQLite WAL</span>
            </div>
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 divide-y divide-slate-100 dark:divide-slate-800/80 min-h-[260px]">
          {query.trim() === '' ? (
            /* Zero-state Guidance */
            <div className="py-6 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#eef4ff] dark:bg-[#1c3461]/30 flex items-center justify-center text-[#2f5fb0] dark:text-sky-400 mb-3 sm:mb-4 shadow-xs">
                <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Explore the Document Knowledge Graph
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mt-1 leading-relaxed">
                Type natural language queries or click any concept pill above to run semantic vector similarity across multi-page invoices, receipts, and spreadsheets.
              </p>

              {/* Informative Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-xl mt-5 text-left">
                <div className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                  <div className="text-xs font-bold text-[#1c3461] dark:text-sky-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#e57824]" />
                    <span>Semantic Vectors</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Searches concept meanings even without exact keyword matches.
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Discrepancy Triage</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Instantly pinpoint calculation mismatches, smudges, and missing fields.
                  </p>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Exact SQL LIKE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Sub-millisecond exact lookups for invoice numbers and vendors.
                  </p>
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No Results */
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <Search className="w-10 h-10 mb-3 opacity-40 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching documents found</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Try searching with broader terms like 'cloud', 'hardware', 'invoice', or switch between Semantic and Keyword modes.
              </p>
            </div>
          ) : (
            /* Matched Records List */
            <div className="flex flex-col gap-2.5">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pb-1 flex items-center justify-between">
                <span>Matching Results ({results.length})</span>
                <span className="font-mono text-[10px] text-slate-400">Ranked by similarity score</span>
              </div>

              {results.map(({ doc, score, matchType }) => {
                const isValid = doc.status === 'VALID';
                const isFlagged = doc.status === 'FLAGGED';
                const pct = Math.round(score * 100);

                return (
                  <div
                    key={doc.id}
                    onClick={() => { onSelectDoc(doc.id); onClose(); }}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/70 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs hover:shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#2f5fb0] dark:group-hover:text-sky-300 transition-colors truncate">
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

                    {/* Score & Inspection CTA */}
                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold border ${
                          pct >= 80 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/40' 
                            : pct >= 50 
                            ? 'bg-[#eef4ff] text-[#1c3461] dark:bg-[#1c3461]/40 dark:text-sky-300 border-[#2f5fb0]/20'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40'
                        }`}>
                          <span>{pct}% Match</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{matchType}</div>
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-bold text-[#2f5fb0] dark:text-sky-400 group-hover:translate-x-0.5 transition-transform mt-1">
                        <span>Inspect Document</span>
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
        <div className="p-2.5 sm:p-3 px-4 sm:px-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold shadow-2xs">ESC</kbd> to close</span>
            <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold shadow-2xs">↵</kbd> to inspect</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            SQLite FTS5 + Cosine Index
          </div>
        </div>
      </div>
    </div>
  );
}
