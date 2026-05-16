// Top bar: brand mark, period readout, quick actions + dark/light toggle.

import { useState, useEffect } from 'react';

const Pill = ({ children, onClick, primary = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={
      'inline-flex items-center gap-2 px-4 py-[9px] rounded-full text-[13px] font-medium font-sans cursor-pointer transition-all duration-150 ' +
      (primary
        ? 'bg-saffron text-ink border border-saffron font-semibold hover:bg-saffron-deep hover:border-saffron-deep'
        : 'bg-ink-2 text-bone-2 border border-line hover:border-saffron hover:text-saffron')
    }
  >
    {children}
  </button>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const PrintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Header({ period, onLoadSample, onExportCSV, onPrint }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('saffron-theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('saffron-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="flex items-center justify-between pb-7 border-b border-line-soft mb-9 max-md:flex-col max-md:items-start max-md:gap-4 no-print">
      <div className="flex items-baseline gap-3.5">
        <div className="w-10 h-10 rounded-lg relative overflow-hidden shadow-saffron"
             style={{ background: 'linear-gradient(135deg, rgb(var(--saffron-rgb)) 0%, rgb(var(--saffron-deep-rgb)) 100%)' }}>
          <span className="absolute inset-0 grid place-items-center font-display font-bold text-[22px] text-ink">₦</span>
        </div>
        <div>
          <div className="font-display font-medium text-[28px] tracking-tight text-bone leading-none">Saffron</div>
          <span className="text-[11px] tracking-[0.18em] uppercase text-muted-2 ml-1">Nigerian VAT, settled.</span>
        </div>
      </div>

      <div className="flex gap-2.5 items-center max-md:flex-wrap">
        <span className="font-mono text-xs text-muted tracking-wider">
          {period ? `Period: ${period}` : 'No data loaded'}
        </span>
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="inline-flex items-center gap-1.5 px-3 py-[9px] rounded-full text-[12px] font-medium bg-ink-2 text-bone-2 border border-line hover:border-saffron hover:text-saffron transition-all"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
          {dark ? 'Light' : 'Dark'}
        </button>
        <Pill onClick={onLoadSample}><FileIcon /> Try sample</Pill>
        <Pill onClick={onExportCSV}><DownloadIcon /> Export CSV</Pill>
        <Pill primary onClick={onPrint}><PrintIcon /> Print / PDF</Pill>
      </div>
    </header>
  );
}
