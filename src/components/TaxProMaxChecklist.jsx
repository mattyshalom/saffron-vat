// TaxPro-Max filing readiness checklist.
// Each item is derived from the live summary data — green when satisfied, amber when needs attention.

import { useMemo } from 'react';

const Check = ({ ok, label, detail }) => (
  <div className={`flex gap-3 items-start py-3.5 border-b border-line-soft last:border-none`}>
    <div className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold border ${
      ok ? 'bg-sage/20 border-sage/40 text-sage' : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
    }`}>
      {ok ? '✓' : '!'}
    </div>
    <div>
      <div className={`text-sm font-medium ${ok ? 'text-bone-2' : 'text-amber-300'}`}>{label}</div>
      {detail && <div className="text-[12px] text-muted mt-0.5">{detail}</div>}
    </div>
  </div>
);

export default function TaxProMaxChecklist({ summary, rows }) {
  const items = useMemo(() => {
    const hasInvoiceNos    = rows.every((r) => r.invoiceNo && r.invoiceNo !== '—');
    const hasCounterparties= rows.every((r) => r.counterparty && r.counterparty !== '—');
    const hasCategories    = rows.every((r) => r.category && r.category !== 'Uncategorized');
    const allDatesValid    = rows.every((r) => !isNaN(new Date(r.date).getTime()));
    const noNegativeNet    = rows.every((r) => r.net >= 0);
    const whtAgentCount    = rows.filter((r) => r.vatWithheld).length;
    const exemptCount      = rows.filter((r) => r.vatExempt).length;
    const netVatPositive   = summary.netVat >= 0;
    const dueDate = (() => {
      if (!summary.last) return null;
      const d = new Date(summary.last);
      d.setMonth(d.getMonth() + 1);
      d.setDate(21);
      return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
    })();

    return [
      {
        ok: allDatesValid,
        label: 'All transaction dates are valid',
        detail: allDatesValid ? `Period: ${summary.period}` : 'One or more rows have invalid or missing dates.',
      },
      {
        ok: hasInvoiceNos,
        label: 'All rows have invoice / reference numbers',
        detail: hasInvoiceNos ? 'Required by FIRS for audit trail.' : 'Some rows are missing InvoiceNo — fill them in the ledger or re-upload.',
      },
      {
        ok: hasCounterparties,
        label: 'All counterparties are named',
        detail: hasCounterparties ? 'Customer and supplier names present.' : 'Some rows are missing Counterparty — FIRS requires vendor identification.',
      },
      {
        ok: hasCategories,
        label: 'All rows are categorised',
        detail: hasCategories ? 'No uncategorised rows.' : 'Some rows are still "Uncategorized" — assign a category for accurate reporting.',
      },
      {
        ok: noNegativeNet,
        label: 'No negative net amounts',
        detail: noNegativeNet ? 'All unit prices and quantities are positive.' : 'Credit notes should be separate negative-type entries; check your data.',
      },
      {
        ok: netVatPositive || summary.netVat === 0,
        label: summary.netVat < 0 ? 'You have a VAT credit — request a refund or carry forward' : 'Net VAT is payable — prepare remittance',
        detail: summary.netVat < 0
          ? `Credit of ₦${Math.abs(summary.netVat).toLocaleString()} — log into TaxPro-Max to apply for refund or credit carry-forward.`
          : `₦${summary.netVat.toLocaleString()} due. Log into TaxPro-Max → VAT → File Return.`,
      },
      {
        ok: whtAgentCount === 0 || true,
        label: whtAgentCount > 0 ? `Verify ${whtAgentCount} VAT-withheld transaction${whtAgentCount > 1 ? 's' : ''} on TaxPro-Max portal` : 'No VAT withholding agent transactions',
        detail: whtAgentCount > 0
          ? 'Log into your TaxPro-Max portal and confirm these appear as already-remitted credits before filing — otherwise you may double-pay.'
          : 'All output VAT collected by you; remit the full output amount minus recoverable input.',
      },
      {
        ok: exemptCount === 0 || true,
        label: exemptCount > 0 ? `${exemptCount} VAT-exempt row${exemptCount > 1 ? 's' : ''} excluded from output VAT` : 'No exempt transactions',
        detail: exemptCount > 0 ? 'Ensure these are genuinely exempt (exports, basic commodities) — misclassification can trigger penalties.' : null,
      },
      {
        ok: !!dueDate,
        label: dueDate ? `Filing deadline: ${dueDate}` : 'Confirm filing deadline',
        detail: 'Returns are due on or before the 21st of the month following the reporting period (FIRS VAT Act, as amended).',
      },
    ];
  }, [summary, rows]);

  const allOk = items.filter((i) => !i.ok).length === 0;

  return (
    <div
      className="border border-line-soft rounded-[14px] overflow-hidden animate-fadeUp print-card"
      style={{ background: 'linear-gradient(180deg, rgba(232,184,78,0.03), transparent), var(--ink-2, #141b24)' }}
    >
      <div className="px-7 py-5 border-b border-line-soft flex items-center justify-between">
        <div>
          <h2 className="font-display font-normal text-xl text-bone">TaxPro-Max Filing Checklist</h2>
          <p className="text-xs text-muted mt-0.5">Review every item before logging into the FIRS portal</p>
        </div>
        <div className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${
          allOk ? 'bg-sage/15 text-sage border-sage/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {allOk ? 'Ready to file' : `${items.filter((i) => !i.ok).length} item${items.filter((i) => !i.ok).length > 1 ? 's' : ''} need attention`}
        </div>
      </div>
      <div className="px-7 pt-1 pb-5">
        {items.map((item, i) => <Check key={i} {...item} />)}
      </div>
    </div>
  );
}
