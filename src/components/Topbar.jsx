import React from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Plus, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight,
  Menu
} from 'lucide-react';

export default function Topbar({ 
  currentTab, 
  theme, 
  onToggleTheme, 
  onOpenSearch, 
  onAddPreset,
  onToggleMobileMenu = () => {}
}) {
  const getPageMeta = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Executive Financial Intelligence',
          subtitle: 'Real-time document ingestion throughput, OCR confidence metrics & deterministic validation health',
          badge: 'Overview & Analytics'
        };
      case 'documents':
        return {
          title: 'Documents Repository & Processing Queue',
          subtitle: 'Multi-format digital PDFs, EasyOCR vision scans, Excel workbooks & delimited CSV data streams',
          badge: 'Master Ingestion Queue'
        };
      case 'review_queue':
        return {
          title: 'Human-in-the-Loop Review & Discrepancy Triage',
          subtitle: 'Audit mathematical calculation mismatches, missing required fields & duplicate invoice flags',
          badge: 'Triage Center'
        };
      case 'cross_verification':
        return {
          title: 'Cross-Document Verification & Financial Reconciliation',
          subtitle: 'Autonomous PDF-to-PDF & PDF-to-Excel multi-document reconciliation and variance analysis',
          badge: 'Reconciliation Engine'
        };
      case 'inspector':
        return {
          title: 'Document Inspector & Entity Correction Studio',
          subtitle: 'Visual side-by-side inspection, raw OCR stream inspection, manual editing & audit committing',
          badge: 'Audit & Correction'
        };
      default:
        return {
          title: 'AI Document Intelligence System',
          subtitle: 'Enterprise multi-modal document extraction and financial verification platform',
          badge: 'DocuIntellect AI'
        };
    }
  };

  const meta = getPageMeta();

  return (
    <header className="min-h-16 md:min-h-18 py-3 px-4 sm:px-6 border-b flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md bg-white/95 border-slate-200 dark:bg-[#090d16]/95 dark:border-slate-800/90 shadow-2xs">
      
      {/* Mobile Hamburger Menu Toggle + Title & Description */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <button
          onClick={onToggleMobileMenu}
          className="flex md:hidden p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d06a16] bg-[#fff4d6] dark:bg-[#e57824]/20 dark:text-[#f28c28] px-2 py-0.5 rounded-md border border-[#e57824]/30 font-sans">
              {meta.badge}
            </span>
            <span className="text-[11px] font-bold text-[#1c3461] dark:text-sky-300 hidden sm:inline">
              • Cottage Care Financial Platform
            </span>
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate mt-0.5">
            {meta.title}
          </h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate hidden md:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Mobile Search Icon Button (visible on <md) */}
        <button
          onClick={onOpenSearch}
          className="flex md:hidden p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs"
          title="Search documents and vectors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Desktop Search Bar Input Pill */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 text-xs transition-all w-56 lg:w-64 justify-between shadow-2xs hover:shadow-xs group"
          title="Search documents and semantic vectors (⌘K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#2f5fb0] dark:text-slate-400 transition-colors" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Search &amp; Vectors...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold shadow-2xs">⌘K</kbd>
        </button>

        {/* Quick Sample File Injector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors border border-slate-300 dark:border-slate-700 shadow-2xs">
            <Plus className="w-3.5 h-3.5 text-[#e57824] stroke-[2.5]" />
            <span className="hidden sm:inline">Inject Sample</span>
            <span className="sm:hidden">Sample</span>
          </button>
          
          <div className="absolute right-0 mt-1 w-64 sm:w-68 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="px-3.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Inject Test Document
            </div>
            <button
              onClick={() => onAddPreset('flagged_math')}
              className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"></span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Receipt (Math Discrepancy)</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Total doesn't match subtotal + tax</div>
              </div>
            </button>
            <button
              onClick={() => onAddPreset('flagged_missing')}
              className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0"></span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">CSV Log (Missing Invoice #)</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Mandatory reference empty</div>
              </div>
            </button>
            <button
              onClick={() => onAddPreset('clean_pdf')}
              className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Clean Digital PDF</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">100% calculation pass</div>
              </div>
            </button>
          </div>
        </div>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
}

