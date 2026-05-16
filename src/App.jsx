import { useMemo, useState, useCallback } from 'react';
import { parseCSV, readFileAsRows } from './lib/csv.js';
import { computeSummary, buildFilingCSV } from './lib/compute.js';
import { SAMPLE_CSV } from './data/sample.js';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import UploadZone from './components/UploadZone.jsx';
import Ribbon from './components/Ribbon.jsx';
import KpiStrip from './components/KpiStrip.jsx';
import TrendChart from './components/charts/TrendChart.jsx';
import SplitChart from './components/charts/SplitChart.jsx';
import CategoryChart from './components/charts/CategoryChart.jsx';
import TopItemsChart from './components/charts/TopItemsChart.jsx';
import TopRanking from './components/TopRanking.jsx';
import Ledger from './components/Ledger.jsx';
import ReturnSummary from './components/ReturnSummary.jsx';
import CounterpartySummary from './components/CounterpartySummary.jsx';
import TaxProMaxChecklist from './components/TaxProMaxChecklist.jsx';
import Toast from './components/Toast.jsx';
import Footer from './components/Footer.jsx';

const SectionTitle = ({ title, sub }) => (
  <div className="flex items-baseline justify-between mb-4 mt-12">
    <div className="flex items-center gap-3">
      <span className="block w-[3px] self-stretch rounded-full bg-saffron opacity-70" aria-hidden />
      <h2 className="font-display font-normal text-[26px] tracking-tight text-bone">{title}</h2>
    </div>
    <span className="font-mono text-xs text-muted-2 uppercase tracking-[0.1em]">{sub}</span>
  </div>
);

const Card = ({ title, sub, children, className = '' }) => (
  <div className={`bg-ink-2 border border-line-soft rounded-[14px] p-6 print-card ${className}`}>
    {title && <h3 className="font-display font-medium text-base text-bone mb-1.5 print-text">{title}</h3>}
    {sub && <div className="text-xs text-muted mb-[18px] print-muted">{sub}</div>}
    {children}
  </div>
);

export default function App() {
  // Each period: { id: string, rows: [], summary: {} }
  const [periods, setPeriods] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [toast, setToast] = useState('');

  const activePeriod = periods.find((p) => p.id === activeId) || null;
  const activeRows = activePeriod?.rows || [];
  const summary = activePeriod?.summary || null;

  // Previous period for MoM comparison (the one before active in chronological order)
  const prevSummary = useMemo(() => {
    if (periods.length < 2 || !activeId) return null;
    const sorted = [...periods].sort((a, b) => (a.summary.first < b.summary.first ? -1 : 1));
    const idx = sorted.findIndex((p) => p.id === activeId);
    return idx > 0 ? sorted[idx - 1].summary : null;
  }, [periods, activeId]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  }, []);

  const loadRows = useCallback((newRows) => {
    if (!newRows.length) { showToast('No valid transactions found in that file.'); return; }
    const s = computeSummary(newRows);
    const id = s.period;
    setPeriods((prev) => {
      const exists = prev.find((p) => p.id === id);
      if (exists) return prev.map((p) => p.id === id ? { id, rows: newRows, summary: s } : p);
      return [...prev, { id, rows: newRows, summary: s }];
    });
    setActiveId(id);
    showToast(`Loaded ${newRows.length} transactions for ${s.period}`);
  }, [showToast]);

  // Inline edit: update a field on a single row and recompute
  const handleRowChange = useCallback((rowIndex, field, value) => {
    setPeriods((prev) => prev.map((p) => {
      if (p.id !== activeId) return p;
      const updated = p.rows.map((r, i) => {
        if (i !== rowIndex) return r;
        const next = { ...r, [field]: value };
        // Recompute derived numeric fields when editable fields change
        const net = next.qty * next.unitPrice;
        const vat = next.vatExempt ? 0 : net * (next.vatRate / 100);
        const gross = net + vat;
        const whtAmount = net * ((next.whtRate || 0) / 100);
        return { ...next, net, vat, gross, whtAmount };
      });
      return { ...p, rows: updated, summary: computeSummary(updated) };
    }));
  }, [activeId]);

  const handleFile = useCallback(async (file) => {
    try { loadRows(await readFileAsRows(file)); }
    catch (err) { showToast(`Failed to read file: ${err.message}`); }
  }, [loadRows, showToast]);

  const loadSample = useCallback(() => loadRows(parseCSV(SAMPLE_CSV)), [loadRows]);

  const handlePrint = useCallback(() => window.print(), []);

  const handleExportCSV = useCallback(() => {
    if (!activeRows.length) { showToast('Load some data first'); return; }
    const csv = buildFilingCSV(activeRows, summary);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saffron-vat-${summary.period.replace(/\s/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Filing CSV exported');
  }, [activeRows, summary, showToast]);

  const removePeriod = useCallback((id) => {
    setPeriods((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activeId === id) setActiveId(next[next.length - 1]?.id || null);
      return next;
    });
  }, [activeId]);

  const hasData = activeRows.length > 0;

  return (
    <div className="max-w-[1320px] mx-auto px-10 pt-8 pb-20 max-md:px-5">
      <Header
        period={summary?.period}
        onLoadSample={loadSample}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
      />
      <Hero period={summary?.period} />

      {/* Period tabs */}
      {periods.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6 no-print">
          {[...periods]
            .sort((a, b) => (a.summary.first < b.summary.first ? -1 : 1))
            .map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveId(p.id)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                    p.id === activeId
                      ? 'bg-saffron text-ink border-saffron'
                      : 'bg-ink-2 text-bone-2 border-line hover:border-saffron hover:text-saffron'
                  }`}
                >
                  {p.id}
                </button>
                <button
                  onClick={() => removePeriod(p.id)}
                  className="text-muted-2 hover:text-brick text-[11px] px-1"
                  title="Remove period"
                >✕</button>
              </div>
            ))}
          <button
            onClick={() => document.getElementById('upload-trigger')?.click()}
            className="px-4 py-1.5 rounded-full text-[12px] font-medium border border-dashed border-line text-muted hover:border-saffron hover:text-saffron transition-all"
          >
            + Add period
          </button>
        </div>
      )}

      {!hasData && <UploadZone onFile={handleFile} onLoadSample={loadSample} />}

      {/* Hidden file input for "Add period" when data is already loaded */}
      {hasData && (
        <input
          id="upload-trigger"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />
      )}

      {hasData && summary && (
        <section>
          <Ribbon count={activeRows.length} period={summary.period} rateLabel={summary.rateLabel} />
          <KpiStrip summary={summary} prevSummary={prevSummary} />

          <SectionTitle title="The shape of the month" sub="Trends & Composition" />
          <div className="grid grid-cols-[1.5fr_1fr] gap-5 max-md:grid-cols-1 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <Card title="Daily revenue & VAT collected" sub="Sales activity through the period">
              <div className="relative h-[260px]"><TrendChart rows={activeRows} /></div>
            </Card>
            <Card title="Sales vs purchases" sub="Net amounts, by transaction type">
              <div className="relative h-[260px]"><SplitChart summary={summary} /></div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 mt-5 animate-fadeUp" style={{ animationDelay: '0.15s' }}>
            <Card title="VAT contribution by category" sub="Where the tax is being generated">
              <div className="relative h-[260px]"><CategoryChart rows={activeRows} /></div>
            </Card>
            <Card title="Top items by revenue" sub="Your highest-grossing offerings">
              <div className="relative h-[260px]"><TopItemsChart rows={activeRows} /></div>
            </Card>
          </div>

          <SectionTitle title="Top-performing plans & items" sub="Ranked by revenue contribution" />
          <Card className="animate-fadeUp">
            <TopRanking rows={activeRows} />
          </Card>

          <SectionTitle title="Counterparty breakdown" sub="Revenue, VAT & WHT by customer / supplier" />
          <CounterpartySummary rows={activeRows} />

          <SectionTitle title="Transaction ledger" sub="All entries · sortable · searchable · editable" />
          <Ledger rows={activeRows} onRowChange={handleRowChange} />

          <SectionTitle title="VAT return summary" sub="FIRS-style filing snapshot" />
          <ReturnSummary summary={summary} />

          <SectionTitle title="Filing checklist" sub="TaxPro-Max readiness" />
          <TaxProMaxChecklist summary={summary} rows={activeRows} />

          <Footer />
        </section>
      )}

      <Toast message={toast} />

      {/* PDF cover page — hidden on screen, appears as page 1 when printing */}
      {hasData && summary && (
        <div id="pdf-cover">
          <div style={{ marginBottom: 12, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888' }}>
            Saffron · Nigerian VAT Filing Assistant
          </div>
          <div style={{ fontSize: 42, fontFamily: 'Fraunces, serif', fontWeight: 300, marginBottom: 8, color: '#111' }}>
            Value Added Tax Return
          </div>
          <div style={{ fontSize: 22, fontFamily: 'Fraunces, serif', color: '#c9962a', marginBottom: 32 }}>
            {summary.period}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 48px', maxWidth: 500, fontSize: 13 }}>
            {[
              ['Reporting period', summary.period],
              ['Total taxable sales', `₦${summary.taxableSales.toLocaleString()}`],
              ['Output VAT to remit', `₦${summary.outputVatDue.toLocaleString()}`],
              ['Input VAT recoverable', `₦${summary.inputVat.toLocaleString()}`],
              ['Net VAT payable', `₦${summary.netVat.toLocaleString()}`],
              ['VAT rate(s)', summary.rateLabel],
              ['Sales invoices', summary.sales.length],
              ['Purchase invoices', summary.purch.length],
              ['Generated', new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginBottom: 2 }}>{k}</div>
                <div style={{ fontWeight: 600, color: '#111' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, fontSize: 11, color: '#aaa', borderTop: '1px solid #ddd', paddingTop: 16 }}>
            Generated by Saffron · For filing reference only · Saffron does not submit on your behalf.
          </div>
        </div>
      )}
    </div>
  );
}
