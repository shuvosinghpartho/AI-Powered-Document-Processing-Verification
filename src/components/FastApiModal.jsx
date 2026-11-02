import React from 'react';
import { Settings, X, Server, Terminal, CheckCircle2 } from 'lucide-react';

export default function FastApiModal({ 
  isOpen, 
  onClose, 
  config, 
  onSaveConfig,
  onToast 
}) {
  const [localConfig, setLocalConfig] = React.useState(config);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig(localConfig);
    onToast('Updated FastAPI backend connection settings', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                FastAPI Backend Connection
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure processing execution engine and endpoints
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Execution Architecture
            </label>
            <select
              value={localConfig.mode}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, mode: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="simulator">In-Browser Async Simulator (Gemini + EasyOCR + SQLite Mock)</option>
              <option value="live">Live FastAPI Server (POST /api/v1/extract)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Backend Endpoint URL
            </label>
            <input
              type="text"
              value={localConfig.baseUrl}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="http://localhost:8000"
              className="w-full h-10 px-3 font-mono rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex flex-col gap-1.5">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sample cURL Request to verify backend:</span>
            </div>
            <code className="text-indigo-600 dark:text-indigo-400">
              curl -X POST "{localConfig.baseUrl}/api/v1/extract" -F "file=@invoice.pdf"
            </code>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

