// FIRS-style "draft return" panel.
// Designed to read like a filing document so the user trusts what they're about to file.

import { fmtN } from '../lib/format.js';

const Row = ({ label, sub, value, total = false, deduction = false }) => (
  <div
    className={
      'grid grid-cols-[1fr_auto] py-3.5 items-center ' +
      (total
        ? 'pt-[22px] pb-[22px] -mx-7 px-7 mt-2 border-t-2 border-saffron print-total'
        : deduction
          ? 'ml-5 pl-3 border-l-2 border-amber-500/50 border-b border-line-soft last:border-b-0'
          : 'border-b border-line-soft last:border-none')
    }
    style={
      total
        ? { background: 'linear-gradient(90deg, rgba(232,184,78,0.06), transparent)' }
        : deduction
          ? { background: 'rgba(232,184,78,0.04)' }
          : {}
    }
  >
    <div
      className={
        total
          ? 'font-display text-lg text-bone font-medium print-text'
          : deduction
            ? 'text-amber-400/80 text-[13px] print-text'
            : 'text-bone-2 text-sm print-text'
      }
    >
      {label}
      {sub && <span className="block text-[11.5px] text-muted mt-0.5 print-muted">{sub}</span>}
    </div>
    <div
      className={
        total
          ? 'font-display text-2xl text-saffron font-medium print-accent'
          : deduction
            ? 'font-mono text-[14px] text-amber-400/80 print-text'
            : 'font-mono text-[15px] text-bone print-text'
      }
    >
      {value}
    </div>
  </div>
);

export default function ReturnSummary({ summary }) {
  return (
    <div
      className="border border-line-soft rounded-[14px] overflow-hidden animate-fadeUp print-card"
      style={{ background: 'linear-gradient(180deg, rgba(232,184,78,0.04), transparent), #141b24' }}
    >
      <div className="px-7 py-6 border-b border-line-soft flex justify-between items-start">
        <div>
          <h2 className="font-display font-normal text-2xl text-bone print-text">
            Value Added Tax Return
          </h2>
          <div className="text-xs text-muted mt-1 tracking-wider print-muted">
            Form FIRS-VAT-001 · Reporting period <span>{summary.period}</span>
          </div>
        </div>
        <div className="border border-saffron text-saffron px-3.5 py-1.5 rounded-md font-mono text-[11px] tracking-widest uppercase print-accent">
          Draft
        </div>
      </div>

      <div className="px-7 pt-2 pb-6">
        <Row
          label="Total taxable sales"
          sub="Net amount of VAT-able sales"
          value={`₦${fmtN(summary.taxableSales)}`}
        />
        <Row
          label="Output VAT charged"
          sub={`VAT collected from customers (${summary.rateLabel})`}
          value={`₦${fmtN(summary.outputVat)}`}
        />
        {summary.outputVatWithheld > 0 && (
          <Row
            label="Withheld by VAT-agent customers"
            sub="Already remitted to FIRS on your TIN — do not remit again"
            value={`− ₦${fmtN(summary.outputVatWithheld)}`}
            deduction
          />
        )}
        <Row
          label="Output VAT you must remit"
          sub="Portion collected by you, to be filed on TaxPro-Max"
          value={`₦${fmtN(summary.outputVatDue)}`}
        />
        <Row
          label="Total taxable purchases"
          sub="Net amount of VAT-able input purchases"
          value={`₦${fmtN(summary.taxablePurch)}`}
        />
        <Row
          label="Input VAT recoverable"
          sub={`VAT paid on business inputs (${summary.rateLabel}) — deduct from output`}
          value={`₦${fmtN(summary.inputVat)}`}
        />
        <Row
          label="Number of sales invoices"
          sub="Distinct sale entries this period"
          value={summary.sales.length}
        />
        <Row
          label="Number of purchase invoices"
          sub="Distinct purchase entries this period"
          value={summary.purch.length}
        />
        <Row label="Net VAT payable to FIRS" value={`₦${fmtN(summary.netVat)}`} total />

        <p className="mt-[18px] text-xs text-muted leading-relaxed print-muted">
          VAT rate(s) in use: {summary.rateLabel}. Net VAT = Output VAT you remit − Input VAT recoverable. Rows marked <strong className="text-bone">VATWithheld = Y</strong> represent sales where the customer (a VAT withholding agent) remits your VAT directly to FIRS — verify these appear on your TaxPro-Max portal before filing. Returns are due on or before the 21st day of the following month under the FIRS VAT Act (as amended). Saffron does not file on your behalf.
        </p>
      </div>
    </div>
  );
}
