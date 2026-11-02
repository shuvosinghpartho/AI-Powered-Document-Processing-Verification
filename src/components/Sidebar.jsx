import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  AlertTriangle, 
  UploadCloud, 
  Search, 
  Sliders, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Cpu,
  GitCompare
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  flaggedCount = 0, 
  totalCount = 0,
  isCollapsed, 
  setIsCollapsed,
  onOpenUpload,
  onOpenSearch
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents Repository', icon: Files, badge: totalCount },
    { id: 'review_queue', label: 'Flagged Review Queue', icon: AlertTriangle, badge: flaggedCount, badgeColor: 'bg-rose-500 text-white' },
    { id: 'cross_verification', label: 'PDF-Excel Cross Verify', icon: GitCompare },
  ];

  return (
    <aside className={`transition-all duration-300 flex-shrink-0 flex flex-col justify-between border-r bg-white dark:bg-[#0b1120] border-slate-200 dark:border-slate-800/80 z-30 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1c3461] via-[#2f5fb0] to-[#e57824] flex items-center justify-center text-white shadow-md shadow-[#1c3461]/25 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-extrabold tracking-tight text-[#1c3461] dark:text-white truncate font-sans">
                  Cottage <span className="text-[#e57824]">Intellect</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">Document Intelligence System</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Upload CTA */}
        <div className="p-3">
          <button
            onClick={onOpenUpload}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#1c3461] to-[#2f5fb0] hover:from-[#16294d] hover:to-[#264c8d] shadow-sm shadow-[#1c3461]/30 transition-all ${
              isCollapsed ? 'px-2' : ''
            }`}
            title="Upload Documents"
          >
            <UploadCloud className="w-4 h-4 flex-shrink-0 text-amber-300" />
            {!isCollapsed && <span>Upload Document</span>}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 flex flex-col gap-1">
          <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '•••' : 'Navigation'}
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#eef4ff] text-[#1c3461] dark:bg-[#1c3461]/40 dark:text-sky-300 border-l-2 border-[#e57824] pl-2.5 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#e57824]' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    item.badgeColor || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Action Shortcut: Global Search */}
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all mt-1"
            title="AI Semantic Search"
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              {!isCollapsed && <span>Search &amp; Vectors</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">⌘K</span>
            )}
          </button>
        </nav>
      </div>

      {/* Footer System Specs */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#2f5fb0]" />
                <span>Extraction Engine</span>
              </span>
              <span className="font-mono text-emerald-500 font-bold">Online</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Gemini 3.5 Flash Lite + EasyOCR</div>
          </div>
        ) : (
          <div className="flex justify-center" title="Engine Online">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </div>
        )}
      </div>
    </aside>
  );
}

