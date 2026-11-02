import React from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-2xl text-xs font-semibold border flex items-center justify-between gap-3 animate-slideUp ${
            t.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-800 text-emerald-200'
              : t.type === 'warning'
              ? 'bg-amber-950/95 border-amber-800 text-amber-200'
              : 'bg-slate-900/95 border-slate-700 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : t.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            )}
            <span>{t.message}</span>
          </div>

          <button
            onClick={() => onRemove(t.id)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

