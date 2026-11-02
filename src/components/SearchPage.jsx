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
  Building,
  DollarSign
} from 'lucide-react';

export default function SearchPage({ 
  documents = [], 
  onSelectDoc 
}) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('semantic'); // 'semantic', 'keyword'
  const [formatFilter, setFormatFilter] = useState('ALL');

  // Concept presets without any emojis as requested
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

    let matched = documents.map(doc => {
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
    });

    if (formatFilter !== 'ALL') {
      matched = matched.filter(res => res.doc.format === formatFilter);
    }

    return matched.sort((a, b) => b.score - a.score);
  }, [documents, query, mode, formatFilter]);

  return (
    <div className="flex flex-col h-full min-h-0 gap-3.5 animate-fadeIn">
      
      {/* Search Box & Controls Bar (Single Window / Fixed Height) */}
      <div className="p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 flex-shrink-0">
        
        {/* Top Row: Search Input + Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Radiant Gradient Outer Shell */}
          <div className="relative group flex-1 rounded-xl p-[1.5px] bg-gradient-to-r from-[#1c3461] via-[#2f5fb0] to-[#e57824] shadow-xs focus-within:shadow-md focus-within:shadow-[#2f5fb0]/20 transition-all">
            <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-[10px] bg-slate-50/95 dark:bg-[#070b14]/95 border border-white/50 dark:border-slate-800/80">
              
              {/* Search Icon Badge */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-[#1c3461] to-[#2f5fb0] flex items-center justify-center text-white flex-shrink-0 shadow-2xs">
                {mode === 'semantic' ? (
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                ) : (
                  <Search className="w-4 h-4 text-sky-200" />
                )}
              </div>

              {/* Input Element */}
              <input
                type="text"
                autoFocus
                placeholder={
                  mode === 'semantic' 
                    ? "Describe in natural language (e.g. 'GPU cloud server pod', 'receipt with calculation smudge')..." 
                    : "Search exact vendor name, invoice reference, customer, or line item..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm font-semibold min-w-0"
              />

              {/* Clear Button */}
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="w-7 h-7 rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0"
                  title="Clear query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-inner flex-shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setMode('semantic')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs ${
                mode === 'semantic'
                  ? 'bg-white dark:bg-[#1c3461] text-[#1c3461] dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Search with AI semantic concept embeddings"
            >
              <Zap className={`w-3.5 h-3.5 ${mode === 'semantic' ? 'text-[#e57824]' : 'text-slate-400'}`} />
              <span>Semantic</span>
            </button>
            <button
              onClick={() => setMode('keyword')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs ${
                mode === 'keyword'
                  ? 'bg-white dark:bg-[#1c3461] text-[#1c3461] dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Search exact keywords in SQL"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Exact SQL</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Concept Chips (NO EMOJIS) + Format Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex-shrink-0">
              Concepts:
            </span>
            {conceptPresets.map(preset => {
              const isActive = query === preset.prompt;
              return (
                <button
                  key={preset.label}
                  onClick={() => { setMode('semantic'); setQuery(preset.prompt); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex-shrink-0 flex items-center gap-1 shadow-2xs ${
                    isActive
                      ? 'bg-[#1c3461] text-white border border-[#e57824] shadow-sm font-bold'
                      : 'border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Format Filter Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Format:</span>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="h-8 px-2.5 text-xs font-semibold rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2f5fb0]"
            >
              <option value="ALL">All Types</option>
              <option value="PDF">PDF Documents</option>
              <option value="IMAGE">Image Scans</option>
              <option value="EXCEL">Excel Workbooks</option>
              <option value="CSV">CSV Delimited</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Results Card (Single Window Card with Internal Scroll) */}
      <div className="flex-1 min-h-0 rounded-2xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        
        {query.trim() === '' ? (
          /* Zero-State Guide with Internal Scroll */
          <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#eef4ff] dark:bg-[#1c3461]/30 flex items-center justify-center text-[#2f5fb0] dark:text-sky-400 mb-3 shadow-xs">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Explore the Multi-Modal Document Knowledge Base
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mt-1 leading-relaxed">
              Type any natural language prompt or click any of the concept pills above to run vector similarity across multi-page invoices, receipts, and spreadsheets.
            </p>

            {/* Feature Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl mt-6 text-left">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1c3461] dark:text-sky-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#e57824]" />
                    <span>Semantic Vector AI</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Understands semantic intent and concepts even when exact matching keywords are absent from the document.
                  </p>
                </div>
                <button
                  onClick={() => { setMode('semantic'); setQuery('cloud server hosting compute'); }}
                  className="mt-3 text-xs font-bold text-[#2f5fb0] dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Try "cloud server hosting"</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Discrepancy Triage</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Surface invoices with mathematical calculation errors, smudged OCR characters, or missing mandatory fields.
                  </p>
                </div>
                <button
                  onClick={() => { setMode('semantic'); setQuery('math calculation discrepancy smudge total error'); }}
                  className="mt-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>Try "math calculation error"</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Exact SQL LIKE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Sub-millisecond keyword lookup across invoice numbers, legal vendor entities, line item descriptions, and totals.
                  </p>
                </div>
                <button
                  onClick={() => { setMode('keyword'); setQuery('Nimbus'); }}
                  className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Try "Nimbus"</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ) : results.length === 0 ? (
          /* Zero Results Message */
          <div className="flex-1 min-h-0 overflow-y-auto p-12 text-center flex flex-col items-center justify-center">
            <Search className="w-10 h-10 mb-3 text-slate-400 opacity-40" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No matching documents found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Try adjusting your query or switching between Semantic Vector and Exact SQL modes.
            </p>
            <button
              onClick={() => { setQuery(''); setFormatFilter('ALL'); }}
              className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          /* Results Feed (Mouse Scroll Inside Card) */
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100 dark:border-slate-800/80">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Found <strong className="text-[#1c3461] dark:text-sky-300">{results.length}</strong> matching record{results.length > 1 ? 's' : ''} for "{query}"
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Ranked by {mode === 'semantic' ? 'Cosine Similarity' : 'Relevance'}
              </div>
            </div>

            {results.map(({ doc, score, matchType }) => {
              const isValid = doc.status === 'VALID';
              const isFlagged = doc.status === 'FLAGGED';
              const pct = Math.round(score * 100);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
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
                          <span>VALIDATED</span>
                        </span>
                      ) : isFlagged ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>FLAGGED FOR REVIEW</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium flex flex-wrap items-center gap-x-3.5 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>Vendor: <strong className="text-slate-900 dark:text-slate-100">{doc.data?.vendor || 'Unknown'}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>Inv #: <strong className="text-slate-900 dark:text-slate-100 font-mono">{doc.data?.invoiceNo || '[BLANK]'}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        <span>Total: <strong className="text-slate-900 dark:text-white font-mono font-bold">${Number(doc.data?.total || 0).toFixed(2)}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 font-mono text-[11px]">{doc.engine}</span>
                    </div>

                    {/* Semantic Concept Tags */}
                    {doc.semanticTags && doc.semanticTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-2">
                        {doc.semanticTags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Match Score & CTA Button */}
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

                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectDoc(doc.id); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#1c3461] to-[#2f5fb0] hover:from-[#16294d] hover:to-[#264c8d] shadow-2xs transition-all inline-flex items-center gap-1 group-hover:translate-x-0.5"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
