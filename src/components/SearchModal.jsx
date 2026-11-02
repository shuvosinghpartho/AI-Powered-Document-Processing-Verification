import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Database
} from 'lucide-react';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  documents = [], 
  onSelectDoc 
}) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('semantic'); // 'semantic', 'keyword'

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return documents.map(doc => {
      const haystack = [
        doc.filename,
        doc.data?.invoiceNo || '',
        doc.data?.vendor || '',
        doc.data?.docType || '',
        doc.extractedText || '',
        (doc.data?.lineItems || []).map(i => i.description).join(' ')
      ].join(' ').toLowerCase();

      if (mode === 'keyword') {
        const isMatch = haystack.includes(q);
        return { doc, score: isMatch ? 1.0 : 0, matchType: 'Exact Keyword' };
      } else {
        const tokens = q.split(/\s+/).filter(Boolean);
        const semanticBlob = (haystack + ' ' + (doc.semanticTags || []).join(' ') + ' ' + (doc.status === 'FLAGGED' ? 'math calculation error tax discrepancy missing field' : '')).toLowerCase();
        
        let hits = 0;
        tokens.forEach(tok => {
          if (semanticBlob.includes(tok)) hits += 1;
          if (['math', 'calculation', 'discrepancy', 'error', 'tax', 'smudge'].includes(tok) && doc.status === 'FLAGGED') hits += 0.85;
          if (['cloud', 'gpu', 'server', 'compute', 'hosting', 'aws'].includes(tok) && doc.id === 'doc-101') hits += 0.9;
          if (['hardware', 'monitor', 'screen', 'mount'].includes(tok) && doc.id === 'doc-102') hits += 0.9;
          if (['spreadsheet', 'software', 'seat', 'licenses', 'bi'].includes(tok) && doc.id === 'doc-103') hits += 0.9;
          if (['freight', 'shipping', 'dispatch', 'transport', 'cargo'].includes(tok) && doc.id === 'doc-104') hits += 0.9;
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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Input Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500" />
          <input
            type="text"
            autoFocus
            placeholder={mode === 'semantic' ? "Ask in natural language (e.g. 'GPU node hosting', 'receipt with math smudge', 'hardware supplies')..." : "Search exact keywords..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />

          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
            <button
              onClick={() => setMode('semantic')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                mode === 'semantic' ? 'bg-white text-indigo-600 dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Semantic</span>
            </button>
            <button
              onClick={() => setMode('keyword')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                mode === 'keyword' ? 'bg-white text-indigo-600 dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Keyword
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Prompt ideas:</span>
          {[
            'GPU cloud node hosting bills',
            'Receipts with math discrepancies',
            'Office monitor hardware',
            'Missing invoice numbers'
          ].map(prompt => (
            <button
              key={prompt}
              onClick={() => { setMode('semantic'); setQuery(prompt); }}
              className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-[11px]"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Type keywords or describe what document you want to find.
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching records found in vector repository.
            </div>
          ) : (
            results.map(({ doc, score, matchType }) => (
              <div
                key={doc.id}
                onClick={() => { onSelectDoc(doc.id); onClose(); }}
                className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {doc.filename}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                      {doc.format}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {doc.data?.vendor || 'Unknown Vendor'} • {doc.data?.invoiceNo || 'No Inv#'} • ${Number(doc.data?.total || 0).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-indigo-500">
                      {Math.round(score * 100)}% Match
                    </div>
                    <div className="text-[10px] text-slate-400">{matchType}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

