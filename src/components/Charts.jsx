import React from 'react';

// SaaS Interactive SVG Area Trend Chart
export function VolumeTrendChart({ data = [] }) {
  const maxCount = Math.max(...data.map(d => d.count), 100);
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = padding + (i * ((chartWidth - padding * 2) / (data.length - 1)));
    const y = chartHeight - padding - ((d.count / maxCount) * (chartHeight - padding * 2));
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Document Processing Velocity</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Weekly ingestion volume &amp; throughput</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Total Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Pass Rate (92.4%)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - padding - (ratio * (chartHeight - padding * 2));
            return (
              <line
                key={idx}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Filled Area */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Smooth Line */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                className="fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-2 group-hover:r-6 transition-all"
              />
              <text
                x={p.x}
                y={chartHeight - 4}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {p.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// SaaS Donut Chart for Document Formats
export function FormatDonutChart({ data = [] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let cumulative = 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Format Distribution</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">By MIME type ingested</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {data.map((item, i) => {
              const strokeDasharray = `${(item.value / total) * 100} ${100 - (item.value / total) * 100}`;
              const strokeDashoffset = -cumulative;
              cumulative += (item.value / total) * 100;
              return (
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">100%</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Indexed</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-2.5 w-full">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
              </div>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Deterministic Validation Health Breakdown Bar
export function ValidationHealthBar({ validCount = 0, flaggedCount = 0, processingCount = 0 }) {
  const total = validCount + flaggedCount + processingCount || 1;
  const validPct = Math.round((validCount / total) * 100);
  const flaggedPct = Math.round((flaggedCount / total) * 100);
  const procPct = 100 - validPct - flaggedPct;

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-900 dark:text-white">Rule Verification Health</span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{validPct}% Pass Rate</span>
      </div>

      {/* Segmented bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
        <div style={{ width: `${validPct}%` }} className="bg-emerald-500 h-full transition-all duration-500" title={`Valid: ${validPct}%`}></div>
        <div style={{ width: `${flaggedPct}%` }} className="bg-rose-500 h-full transition-all duration-500" title={`Flagged: ${flaggedPct}%`}></div>
        <div style={{ width: `${procPct}%` }} className="bg-blue-500 h-full transition-all duration-500" title={`In Progress: ${procPct}%`}></div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {validCount} Clean Verified</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> {flaggedCount} Flagged (HITL)</span>
        {processingCount > 0 && (
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {processingCount} Active</span>
        )}
      </div>
    </div>
  );
}

