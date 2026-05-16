// The four headline KPI tiles with optional month-over-month delta arrows.

import { fmtN } from '../lib/format.js';

const Delta = ({ current, previous, lowerIsBetter = false }) => {
  if (previous == null || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const up = pct >= 0;
  const good = lowerIsBetter ? !up : up;
  return (
    <span className={`ml-2 text-[11px] font-mono ${good ? 'text-sage' : 'text-brick'}`}>
      {up ? '↑' : '↓'}{Math.abs(pct).toFixed(1)}%
    </span>
  );
};

const Kpi = ({ label, value, sub, feature = false, valueColor, prevValue, lowerIsBetter }) => {
  const resolvedValueColor = valueColor || (feature ? 'text-saffron print-accent' : 'text-bone print-text');
  const resolvedLabelColor = feature ? (valueColor ? valueColor.split(' ')[0] : 'text-saffron') : 'text-muted';
  return (
    <div
      className={'p-7 px-6 transition-colors duration-200 ' + (feature ? 'kpi-feature' : 'bg-ink-2 hover:bg-ink-3')}
      style={feature ? { background: 'linear-gradient(135deg, rgb(var(--saffron-rgb) / 0.08), transparent), rgb(var(--ink-2-rgb))' } : {}}
    >
      <div className={`text-[11px] tracking-[0.14em] uppercase font-medium mb-3.5 ${resolvedLabelColor}`}>
        {label}
      </div>
      <div className={`font-display font-normal text-[34px] tracking-tight leading-none ${resolvedValueColor}`}>
        <span className="text-[18px] text-muted mr-1 font-light">₦</span>
        {value}
        {prevValue != null && <Delta current={parseFloat(value.replace(/,/g, ''))} previous={prevValue} lowerIsBetter={lowerIsBetter} />}
      </div>
      <div className="mt-2.5 font-mono text-[11px] text-muted tracking-wider print-muted">{sub}</div>
    </div>
  );
};

export default function KpiStrip({ summary, prevSummary }) {
  const { sales, purch, outputVatDue, outputVatWithheld, inputVat, netVat, taxableSales, taxablePurch } = summary;

  const margin = taxableSales > 0 ? ((taxableSales - taxablePurch) / taxableSales) * 100 : 0;
  const owedText = netVat >= 0 ? 'Payable to FIRS' : 'Refundable / credit';
  const netVatColor = netVat < 0 ? 'text-sage print-accent' : 'text-saffron print-accent';

  return (
    <div
      className="grid grid-cols-4 gap-px bg-line-soft border border-line-soft rounded-[14px] overflow-hidden mb-9 max-md:grid-cols-2 animate-fadeUp print-card"
      style={{ animationDelay: '0.05s' }}
    >
      <Kpi
        label="Output VAT (Sales)"
        value={fmtN(outputVatDue)}
        prevValue={prevSummary ? prevSummary.outputVatDue : null}
        lowerIsBetter={false}
        sub={
          outputVatWithheld > 0 ? (
            <>To remit · <span className="text-muted">₦{fmtN(outputVatWithheld)} withheld</span></>
          ) : (
            <>From <span className="text-sage">{sales.length}</span> sale{sales.length === 1 ? '' : 's'}</>
          )
        }
      />
      <Kpi
        label="Input VAT (Purchases)"
        value={fmtN(inputVat)}
        prevValue={prevSummary ? prevSummary.inputVat : null}
        lowerIsBetter={false}
        sub={<>From <span className="text-brick">{purch.length}</span> purchase{purch.length === 1 ? '' : 's'}</>}
      />
      <Kpi
        label="Net VAT Payable"
        value={fmtN(Math.abs(netVat))}
        prevValue={prevSummary ? Math.abs(prevSummary.netVat) : null}
        lowerIsBetter={true}
        sub={owedText}
        feature
        valueColor={netVatColor}
      />
      <Kpi
        label="Total Revenue"
        value={fmtN(taxableSales)}
        prevValue={prevSummary ? prevSummary.taxableSales : null}
        lowerIsBetter={false}
        sub={<>Gross margin <span className={margin >= 0 ? 'text-sage' : 'text-brick'}>{margin.toFixed(1)}%</span></>}
      />
    </div>
  );
}
