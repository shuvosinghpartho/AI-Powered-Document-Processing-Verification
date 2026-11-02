import React from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Settings, 
  Plus, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Bell 
} from 'lucide-react';

export default function Topbar({ 
  currentTab, 
  theme, 
  onToggleTheme, 
  onOpenFastApi, 
  onOpenSearch, 
  onAddPreset,
  fastApiMode = 'simulator'
}) {
  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Executive Overview & Analytics';
      case 'documents': return 'Documents Repository & Processing Queue';
      case 'review_queue': return 'Human-in-the-Loop Review Queue';
      case 'cross_verification': return 'Cross-Document Verification & Financial Reconciliation';
      default: return 'Document Intelligence Workspace';
    }
  };

  return (
    <header className="h-16 px-6 border-b flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md bg-white/90 border-slate-200 dark:bg-[#080c14]/90 dark:border-slate-800/80">
      
      {/* Title & Breadcrumbs */}
      <div>
        <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <span className="font-bold text-[#1c3461] dark:text-sky-300">Cottage Home Care</span>
          <span>•</span>
          <span>Financial Document Operations</span>
        </div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          {getBreadcrumbTitle()}
        </h2>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar Input Pill */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 text-xs transition-all w-64 justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-medium">Search documents or concepts...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-bold">⌘K</kbd>
        </button>

        {/* Quick Sample File Injector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700">
            <Plus className="w-3.5 h-3.5 text-[#e57824]" />
            <span>Inject Sample</span>
          </button>
          
          <div className="absolute right-0 mt-1 w-64 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Inject Test Document
            </div>
            <button
              onClick={() => onAddPreset('flagged_math')}
              className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">Receipt (Math Discrepancy)</div>
                <div className="text-[10px] text-slate-400">Smudge on total amount</div>
              </div>
            </button>
            <button
              onClick={() => onAddPreset('flagged_missing')}
              className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">CSV Log (Missing Invoice #)</div>
                <div className="text-[10px] text-slate-400">Blank mandatory field</div>
              </div>
            </button>
            <button
              onClick={() => onAddPreset('clean_pdf')}
              className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <div>
                <div className="font-semibold">Clean Digital PDF</div>
                <div className="text-[10px] text-slate-400">100% verification pass</div>
              </div>
            </button>
          </div>
        </div>

        {/* FastAPI Status Button */}
        <button
          onClick={onOpenFastApi}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Configure FastAPI Server"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
          <span>{fastApiMode === 'live' ? 'FastAPI Live' : 'FastAPI: Simulator'}</span>
          <Settings className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
}

