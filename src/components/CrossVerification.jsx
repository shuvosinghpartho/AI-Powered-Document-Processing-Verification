import React, { useState, useEffect, useMemo } from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Layers,
  Scale,
  ShieldCheck,
  Download
} from 'lucide-react';

export default function CrossVerification({ 
  documents = [], 
  fastApiConfig = { baseUrl: 'http://localhost:8000', mode: 'live' },
  onToast = () => {}
}) {
  const [docAId, setDocAId] = useState('');
  const [docBId, setDocBId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);

  // Default initial pair if available
  useEffect(() => {
    if (documents.length >= 2 && !docAId && !docBId) {
      const pdfDoc = documents.find(d => d.format === 'PDF') || documents[0];
      const otherDoc = documents.find(d => d.id !== pdfDoc.id) || documents[1];
      if (pdfDoc && otherDoc) {
        setDocAId(pdfDoc.id);
        setDocBId(otherDoc.id);
      }
    }
  }, [documents, docAId, docBId]);

  const docA = useMemo(() => documents.find(d => d.id === docAId) || null, [documents, docAId]);
  const docB = useMemo(() => documents.find(d => d.id === docBId) || null, [documents, docBId]);

  // Run Cross-Verification
  const handleRunVerification = async () => {
    if (!docAId || !docBId) {
      onToast('Please select two documents to cross-verify.', 'warning');
      return;
    }
    if (docAId === docBId) {
      onToast('Please select two distinct documents.', 'warning');
      return;
    }

    setIsLoading(true);

    if (fastApiConfig.mode === 'live') {
      try {
        const res = await fetch(`${fastApiConfig.baseUrl}/api/v1/cross-verify?doc_a_id=${docAId}&doc_b_id=${docBId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
          setIsLoading(false);
          onToast(`Cross-verification complete: ${data.status}`, data.isVerified ? 'success' : 'warning');
          return;
        }
      } catch (err) {
        console.warn('API cross-verify error, running local calculation:', err);
      }
    }

    // Client-side fallback calculation
    setTimeout(() => {
      if (!docA || !docB) {
        setIsLoading(false);
        return;
      }
      const dataA = docA.data || {};
      const dataB = docB.data || {};

      const discrepancies = [];
      const fieldComparisons = [];

      // 1. Vendor
      const vA = (dataA.vendor || '').trim().toLowerCase();
      const vB = (dataB.vendor || '').trim().toLowerCase();
      const vMatch = (vA === vB) || (vA && vB && (vA.includes(vB) || vB.includes(vA)));
      if (!vMatch && vA && vB) {
        discrepancies.push(`Vendor Mismatch: '${dataA.vendor}' vs '${dataB.vendor}'`);
      }
      fieldComparisons.push({
        field: 'Vendor / Supplier',
        docA: dataA.vendor || 'N/A',
        docB: dataB.vendor || 'N/A',
        match: vMatch
      });

      // 2. Reference No
      const rA = (dataA.invoiceNo || '').trim().toLowerCase();
      const rB = (dataB.invoiceNo || '').trim().toLowerCase();
      const rMatch = (rA === rB) || (rA && rB && (rA.includes(rB) || rB.includes(rA)));
      fieldComparisons.push({
        field: 'Invoice / PO Reference',
        docA: dataA.invoiceNo || 'N/A',
        docB: dataB.invoiceNo || 'N/A',
        match: rMatch
      });

      // 3. Currency
      const currMatch = (dataA.currency || 'USD') === (dataB.currency || 'USD');
      fieldComparisons.push({
        field: 'Currency',
        docA: dataA.currency || 'USD',
        docB: dataB.currency || 'USD',
        match: currMatch
      });

      // 4. Total Amount
      const tA = Number(dataA.total || 0);
      const tB = Number(dataB.total || 0);
      const totalDiff = Math.abs(tA - tB);
      const totalMatch = totalDiff < 0.05;
      if (!totalMatch) {
        discrepancies.push(`Total Amount Discrepancy: $${tA.toFixed(2)} (${docA.filename}) vs $${tB.toFixed(2)} (${docB.filename}) [Diff: $${totalDiff.toFixed(2)}]`);
      }
      fieldComparisons.push({
        field: 'Total Amount',
        docA: `$${tA.toFixed(2)}`,
        docB: `$${tB.toFixed(2)}`,
        match: totalMatch
      });

      // 5. Subtotal
      const subA = Number(dataA.subtotal || 0);
      const subB = Number(dataB.subtotal || 0);
      const subDiff = Math.abs(subA - subB);
      const subMatch = subDiff < 0.05;
      fieldComparisons.push({
        field: 'Subtotal',
        docA: `$${subA.toFixed(2)}`,
        docB: `$${subB.toFixed(2)}`,
        match: subMatch
      });

      const passedCount = fieldComparisons.filter(f => f.match).length;
      const score = Math.round((passedCount / fieldComparisons.length) * 100);
      const isVerified = discrepancies.length === 0;

      setReport({
        docA: { id: docA.id, filename: docA.filename, format: docA.format, total: tA },
        docB: { id: docB.id, filename: docB.filename, format: docB.format, total: tB },
        verificationType: `${docA.format} - ${docB.format} Cross-Check`,
        matchScore: score,
        status: isVerified ? 'VERIFIED_MATCH' : 'DISCREPANCY_FLAGGED',
        isVerified,
        discrepancies,
        fieldComparisons
      });
      setIsLoading(false);
      onToast(`Cross-verification complete: ${isVerified ? 'VERIFIED_MATCH' : 'DISCREPANCY_FLAGGED'}`, isVerified ? 'success' : 'warning');
    }, 400);
  };

  const handleExportReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cross_verification_${report.docA.filename}_vs_${report.docB.filename}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onToast('Exported Cross-Verification Audit Report', 'success');
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Task 3 &bull; Cross-Document Verification Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
            PDF &bull; Excel &bull; Image Cross-Reconciliation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Automatically compares invoices against purchase orders, consignments, or duplicate scans to identify
            vendor discrepancies, calculation variances, and unauthorized totals.
          </p>
        </div>

        {report && (
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit JSON</span>
          </button>
        )}
      </div>

      {/* Document Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Document A Selector */}
        <div className="md:col-span-5 p-6 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Document A (Source / Invoice)</span>
            {docA && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                {docA.format}
              </span>
            )}
          </div>

          <select
            value={docAId}
            onChange={(e) => setDocAId(e.target.value)}
            className="w-full h-11 px-3 text-xs font-medium rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select First Document --</option>
            {documents.map(d => (
              <option key={d.id} value={d.id}>
                [{d.format}] {d.filename} &bull; ${Number(d.data?.total || 0).toFixed(2)} &bull; {d.data?.vendor || 'Unknown'}
              </option>
            ))}
          </select>

          {docA && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs font-mono flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Vendor:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{docA.data?.vendor || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice #:</span>
                <span className="text-slate-700 dark:text-slate-300">{docA.data?.invoiceNo || '[BLANK]'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Billed:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">${Number(docA.data?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Central Action Button */}
        <div className="md:col-span-2 flex flex-col items-center justify-center gap-2">
          <button
            onClick={handleRunVerification}
            disabled={isLoading || !docAId || !docBId}
            className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isLoading || !docAId || !docBId
                ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500'
                : 'bg-gradient-to-r from-[#1c3461] to-[#2f5fb0] hover:from-[#16294d] hover:to-[#264c8d] shadow-[#1c3461]/30 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>Reconciling...</span>
              </>
            ) : (
              <>
                <Scale className="w-4 h-4 text-amber-300" />
                <span>Run Cross-Check</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-slate-400 font-mono">Field-by-Field Diff</span>
        </div>

        {/* Document B Selector */}
        <div className="md:col-span-5 p-6 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Document B (Target / PO / Excel)</span>
            {docB && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold">
                {docB.format}
              </span>
            )}
          </div>

          <select
            value={docBId}
            onChange={(e) => setDocBId(e.target.value)}
            className="w-full h-11 px-3 text-xs font-medium rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select Second Document --</option>
            {documents.map(d => (
              <option key={d.id} value={d.id}>
                [{d.format}] {d.filename} &bull; ${Number(d.data?.total || 0).toFixed(2)} &bull; {d.data?.vendor || 'Unknown'}
              </option>
            ))}
          </select>

          {docB && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs font-mono flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Vendor:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{docB.data?.vendor || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice #:</span>
                <span className="text-slate-700 dark:text-slate-300">{docB.data?.invoiceNo || '[BLANK]'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Billed:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">${Number(docB.data?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Results Panel */}
      {report && (
        <div className="p-6 sm:p-8 rounded-3xl border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6 animate-fadeIn">
          
          {/* Header Score Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-lg text-white shadow-md ${
                report.isVerified ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-rose-600 shadow-rose-600/30'
              }`}>
                {report.matchScore}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {report.verificationType}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    report.isVerified 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Cross-Verification Result &bull; {report.isVerified ? 'All financial figures match' : `${report.discrepancies.length} discrepancy detected`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {report.isVerified ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Approved for Automated Ingestion</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Requires Manual Manager Review</span>
                </div>
              )}
            </div>
          </div>

          {/* Discrepancies Alert Box if any */}
          {report.discrepancies.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex flex-col gap-2">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Identified Cross-Verification Inconsistencies:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 dark:text-rose-300 font-mono">
                {report.discrepancies.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side-by-Side Field Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Verification Field</th>
                  <th className="py-3 px-4">{report.docA.filename}</th>
                  <th className="py-3 px-4">{report.docB.filename}</th>
                  <th className="py-3 px-4 text-center">Reconciliation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {report.fieldComparisons.map((fc, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 font-sans">
                      {fc.field}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      {fc.docA}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      {fc.docB}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {fc.match ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>MATCH</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          <span>DISCREPANCY</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

