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
  <div
    className={`bg-ink-2 border border-line-soft rounded-[14px] p-6 print-card ${className}`}
  >
    <h3 className="font-display font-medium text-base text-bone mb-1.5 print-text">{title}</h3>
    {sub && <div className="text-xs text-muted mb-[18px] print-muted">{sub}</div>}
    {children}
  </div>
);

export default function App() {
  const [rows, setRows] = useState([]);
  const [toast, setToast] = useState('');

  const summary = useMemo(() => (rows.length ? computeSummary(rows) : null), [rows]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  }, []);

  const loadRows = useCallback(
    (newRows) => {
      if (!newRows.length) {
        showToast('No valid transactions found in that file.');
        return;
      }
      setRows(newRows);
      const s = computeSummary(newRows);
      showToast(`Loaded ${newRows.length} transactions for ${s.period}`);
    },
    [showToast],
  );

  const handleFile = useCallback(
    async (file) => {
      try {
        const parsed = await readFileAsRows(file);
        loadRows(parsed);
      } catch (err) {
        showToast(`Failed to read file: ${err.message}`);
      }
    },
    [loadRows, showToast],
  );

  const loadSample = useCallback(() => {
    loadRows(parseCSV(SAMPLE_CSV));
  }, [loadRows]);

  const handlePrint = useCallback(() => window.print(), []);

  const handleExportCSV = useCallback(() => {
    if (!rows.length) {
      showToast('Load some data first');
      return;
    }
    const csv = buildFilingCSV(rows, summary);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saffron-vat-${summary.period.replace(/\s/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Filing CSV exported');
  }, [rows, summary, showToast]);

  const hasData = rows.length > 0;

  return (
    <div className="max-w-[1320px] mx-auto px-10 pt-8 pb-20 max-md:px-5">
      <Header
        period={summary?.period}
        onLoadSample={loadSample}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
      />
      <Hero period={summary?.period} />

      {!hasData && <UploadZone onFile={handleFile} onLoadSample={loadSample} />}

      {hasData && summary && (
        <section>
          <Ribbon count={rows.length} period={summary.period} />
          <KpiStrip summary={summary} />

          <SectionTitle title="The shape of the month" sub="Trends & Composition" />
          <div className="grid grid-cols-[1.5fr_1fr] gap-5 max-md:grid-cols-1 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <Card title="Daily revenue & VAT collected" sub="Sales activity through the period">
              <div className="relative h-[260px]">
                <TrendChart rows={rows} />
              </div>
            </Card>
            <Card title="Sales vs purchases" sub="Net amounts, by transaction type">
              <div className="relative h-[260px]">
                <SplitChart summary={summary} />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 mt-5 animate-fadeUp" style={{ animationDelay: '0.15s' }}>
            <Card title="VAT contribution by category" sub="Where the tax is being generated">
              <div className="relative h-[260px]">
                <CategoryChart rows={rows} />
              </div>
            </Card>
            <Card title="Top items by revenue" sub="Your highest-grossing offerings">
              <div className="relative h-[260px]">
                <TopItemsChart rows={rows} />
              </div>
            </Card>
          </div>

          <SectionTitle title="Top-performing plans & items" sub="Ranked by revenue contribution" />
          <Card title="" sub="" className="animate-fadeUp">
            <TopRanking rows={rows} />
          </Card>

          <SectionTitle title="Transaction ledger" sub="All entries · sortable · searchable" />
          <Ledger rows={rows} />

          <SectionTitle title="VAT return summary" sub="FIRS-style filing snapshot" />
          <ReturnSummary summary={summary} />

          <Footer />
        </section>
      )}

      <Toast message={toast} />
    </div>
  );
}
