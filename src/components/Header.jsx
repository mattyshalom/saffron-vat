// Top bar: brand mark, period readout, quick actions (sample, export, print).
// Hidden during print via the .no-print class.

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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PrintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

export default function Header({ period, onLoadSample, onExportCSV, onPrint }) {
  return (
    <header className="flex items-center justify-between pb-7 border-b border-line-soft mb-9 max-md:flex-col max-md:items-start max-md:gap-4 no-print">
      <div className="flex items-baseline gap-3.5">
        <div className="w-10 h-10 rounded-lg relative overflow-hidden shadow-saffron"
             style={{ background: 'linear-gradient(135deg, #e8b84e 0%, #c9962a 100%)' }}>
          <span className="absolute inset-0 grid place-items-center font-display font-bold text-[22px] text-ink">
            ₦
          </span>
        </div>
        <div>
          <div className="font-display font-medium text-[28px] tracking-tight text-bone leading-none">
            Saffron
          </div>
          <span className="text-[11px] tracking-[0.18em] uppercase text-muted-2 ml-1">
            Nigerian VAT, settled.
          </span>
        </div>
      </div>

      <div className="flex gap-2.5 items-center max-md:flex-wrap">
        <span className="font-mono text-xs text-muted tracking-wider">
          {period ? `Period: ${period}` : 'No data loaded'}
        </span>
        <Pill onClick={onLoadSample}>
          <FileIcon /> Try sample
        </Pill>
        <Pill onClick={onExportCSV}>
          <DownloadIcon /> Export CSV
        </Pill>
        <Pill primary onClick={onPrint}>
          <PrintIcon /> Print / PDF
        </Pill>
      </div>
    </header>
  );
}
