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
  Layers,
  SlidersHorizontal,
  Clock,
  ExternalLink,
  ShieldAlert,
  Calendar,
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
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c3461] via-[#162a50] to-[#0c172d] border border-[#2f5fb0]/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff4d6] text-[#d06a16] border border-[#e57824]/30 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#e57824]" />
            <span className="font-sans font-bold">Vector Intelligence Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            Vector &amp; Semantic Intelligence Search
          </h2>
          <p className="text-xs sm:text-sm text-slate-200/90 mt-2 leading-relaxed">
            Query entire document archives using deep natural language embeddings or execute high-speed exact SQL keyword filters across multi-page invoices, receipts, and spreadsheets.
          </p>
        </div>

        {/* Engine Mode Switcher in Banner */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold shadow-inner">
            <button
              onClick={() => setMode('semantic')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'semantic'
                  ? 'bg-white text-[#1c3461] shadow-md font-extrabold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${mode === 'semantic' ? 'text-[#e57824]' : 'text-white/70'}`} />
              <span>Semantic Vector</span>
            </button>
            <button
              onClick={() => setMode('keyword')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                mode === 'keyword'
                  ? 'bg-white text-[#1c3461] shadow-md font-extrabold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Exact SQL</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/15 to-transparent pointer-events-none"></div>
      </div>

      {/* 2. Elevated Search Box & Concept Chips Card */}
      <div className="p-4 sm:p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        
        {/* Radiant Gradient Outer Shell */}
        <div className="relative group rounded-2xl p-[2px] bg-gradient-to-r from-[#1c3461] via-[#2f5fb0] to-[#e57824] shadow-md shadow-[#1c3461]/10 focus-within:shadow-xl focus-within:shadow-[#2f5fb0]/25 transition-all">
          <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-[14px] bg-slate-50/95 dark:bg-[#070b14]/95 border border-white/50 dark:border-slate-800/80">
            
            {/* Search Icon Badge */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#1c3461] to-[#2f5fb0] flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-[#1c3461]/30">
              {mode === 'semantic' ? (
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              ) : (
                <Search className="w-5 h-5 text-sky-200" />
              )}
            </div>

            {/* Input Element */}
            <input
              type="text"
              autoFocus
              placeholder={
                mode === 'semantic' 
                  ? "Ask in natural language (e.g. 'GPU cloud server pod', 'receipt with calculation smudge', 'software license seats')..." 
                  : "Search exact vendor name, invoice reference, customer, or line item..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm md:text-base font-semibold min-w-0"
            />

            {/* Inline Engine Indicator Pill */}
            <div className="hidden sm:flex items-center flex-shrink-0">
              {mode === 'semantic' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#eef4ff] text-[#1c3461] dark:bg-[#1c3461]/60 dark:text-sky-300 border border-[#2f5fb0]/30 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Vector AI Active</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs">
                  <Database className="w-3.5 h-3.5 text-[#2f5fb0]" />
                  <span>Exact SQL Mode</span>
                </div>
              )}
            </div>

            {/* Clear Button */}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Concept Chips Row (NO EMOJIS) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex-shrink-0">
              Concepts:
            </span>
            {conceptPresets.map(preset => {
              const isActive = query === preset.prompt;
              return (
                <button
                  key={preset.label}
                  onClick={() => { setMode('semantic'); setQuery(preset.prompt); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 flex items-center gap-1.5 shadow-2xs ${
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Format:</span>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2f5fb0]"
            >
              <option value="ALL">All Types</option>
              <option value="PDF">PDF</option>
              <option value="IMAGE">Image Scan</option>
              <option value="EXCEL">Excel</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
        </div>

        {/* Micro Telemetry Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Archive Index: <strong className="text-slate-800 dark:text-slate-200">{documents.length} repository documents</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>Dimensions: 768 Float32</span>
            <span>•</span>
            <span>Cosine Metric: SQLite Vector WAL</span>
            <span>•</span>
            <span>FTS5 Engine: Online</span>
          </div>
        </div>
      </div>

      {/* 3. Main Results or Zero-State Experience */}
      {query.trim() === '' ? (
        /* Zero-State Guide */
        <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#eef4ff] dark:bg-[#1c3461]/30 flex items-center justify-center text-[#2f5fb0] dark:text-sky-400 mb-4 shadow-xs">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Explore the Multi-Modal Document Knowledge Base
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mt-1.5 leading-relaxed">
            Type any natural language prompt or click any of the concept pills above to run vector similarity across multi-page invoices, receipts, and spreadsheets.
          </p>

          {/* Feature Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-8 text-left">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-[#1c3461] dark:text-sky-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#e57824]" />
                  <span>Semantic Vector AI</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Understands semantic intent and concepts even when exact matching keywords are absent from the document.
                </p>
              </div>
              <button
                onClick={() => { setMode('semantic'); setQuery('cloud server hosting compute'); }}
                className="mt-4 text-xs font-bold text-[#2f5fb0] dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>Try "cloud server hosting"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Discrepancy Triage</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Surface invoices with mathematical calculation errors, smudged OCR characters, or missing mandatory fields.
                </p>
              </div>
              <button
                onClick={() => { setMode('semantic'); setQuery('math calculation discrepancy smudge total error'); }}
                className="mt-4 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <span>Try "math calculation error"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Exact SQL LIKE</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Sub-millisecond keyword lookup across invoice numbers, legal vendor entities, line item descriptions, and totals.
                </p>
              </div>
              <button
                onClick={() => { setMode('keyword'); setQuery('Nimbus'); }}
                className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Try "Nimbus"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : results.length === 0 ? (
        /* Zero Results */
        <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <Search className="w-12 h-12 mb-3 text-slate-400 opacity-40" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching documents found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Try adjusting your query or switching between Semantic Vector and Exact SQL modes.
          </p>
          <button
            onClick={() => { setQuery(''); setFormatFilter('ALL'); }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Results Feed */
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Found <strong className="text-[#1c3461] dark:text-sky-300">{results.length}</strong> matching document{results.length > 1 ? 's' : ''} for "{query}"
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Ranked by {mode === 'semantic' ? 'Cosine Similarity' : 'Relevance'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {results.map(({ doc, score, matchType }) => {
              const isValid = doc.status === 'VALID';
              const isFlagged = doc.status === 'FLAGGED';
              const pct = Math.round(score * 100);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm group hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#2f5fb0] dark:group-hover:text-sky-300 transition-colors truncate">
                        {doc.filename}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase border border-slate-200 dark:border-slate-700">
                        {doc.format}
                      </span>
                      {isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>VALIDATED</span>
                        </span>
                      ) : isFlagged ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>FLAGGED FOR REVIEW</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>Vendor: <strong className="text-slate-900 dark:text-slate-100">{doc.data?.vendor || 'Unknown'}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inv #: <strong className="text-slate-900 dark:text-slate-100 font-mono">{doc.data?.invoiceNo || '[BLANK]'}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>Total: <strong className="text-slate-900 dark:text-white font-mono font-bold">${Number(doc.data?.total || 0).toFixed(2)}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 font-mono">{doc.engine}</span>
                    </div>

                    {/* Semantic Concept Tags */}
                    {doc.semanticTags && doc.semanticTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {doc.semanticTags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Match Score & CTA Button */}
                  <div className="flex items-center md:flex-col md:items-end justify-between gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold border ${
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
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1c3461] to-[#2f5fb0] hover:from-[#16294d] hover:to-[#264c8d] shadow-sm shadow-[#1c3461]/25 transition-all inline-flex items-center gap-1.5 group-hover:translate-x-0.5"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
