// Breakdown of revenue, VAT, and WHT grouped by counterparty.

import { useMemo, useState } from 'react';
import { fmtN } from '../lib/format.js';
import { aggregateByCounterparty } from '../lib/compute.js';

export default function CounterpartySummary({ rows }) {
  const [filter, setFilter] = useState('all');
  const data = useMemo(() => aggregateByCounterparty(rows), [rows]);

  const visible = filter === 'agents'
    ? data.filter((d) => d.isAgent)
    : filter === 'sales'
      ? data.filter((d) => d.sales > 0)
      : filter === 'purchases'
        ? data.filter((d) => d.purchases > 0)
        : data;

  return (
    <div className="bg-ink-2 border border-line-soft rounded-[14px] overflow-hidden animate-fadeUp print-card">
      <div className="px-[22px] py-[18px] flex gap-3 items-center justify-between border-b border-line-soft no-print flex-wrap">
        <span className="font-mono text-xs text-muted">{visible.length} counterparties</span>
        <div className="flex gap-2">
          {['all', 'sales', 'purchases', 'agents'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all capitalize ${
                filter === f ? 'bg-saffron text-ink border-saffron' : 'bg-ink-3 text-muted border-line hover:border-saffron hover:text-saffron'
              }`}
            >
              {f === 'agents' ? 'WHT agents' : f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {['Counterparty', 'Sales (₦)', 'Purchases (₦)', 'Output VAT (₦)', 'Input VAT (₦)', 'WHT (₦)', 'Txns', 'Role'].map((h) => (
                <th key={h} className="text-left p-3.5 font-medium text-[11px] tracking-wider uppercase text-muted border-b border-line bg-ink-3 print-th whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((d, i) => (
              <tr key={d.counterparty} className={`hover:bg-white/[0.025] ${i % 2 === 0 ? '' : 'bg-white/[0.012]'}`}>
                <td className="p-3.5 border-b border-line-soft text-bone font-medium print-td">
                  {d.counterparty}
                  {d.isAgent && (
                    <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">WHT agent</span>
                  )}
                </td>
                <td className="p-3.5 border-b border-line-soft font-mono text-right text-sage print-td">{d.sales > 0 ? fmtN(d.sales) : '—'}</td>
                <td className="p-3.5 border-b border-line-soft font-mono text-right text-brick print-td">{d.purchases > 0 ? fmtN(d.purchases) : '—'}</td>
                <td className="p-3.5 border-b border-line-soft font-mono text-right text-bone-2 print-td">{d.outputVat > 0 ? fmtN(d.outputVat) : '—'}</td>
                <td className="p-3.5 border-b border-line-soft font-mono text-right text-bone-2 print-td">{d.inputVat > 0 ? fmtN(d.inputVat) : '—'}</td>
                <td className="p-3.5 border-b border-line-soft font-mono text-right text-amber-400 print-td">{d.wht > 0 ? fmtN(d.wht) : '—'}</td>
                <td className="p-3.5 border-b border-line-soft font-mono text-right text-muted print-td">{d.txns}</td>
                <td className="p-3.5 border-b border-line-soft text-muted text-[12px] print-td">
                  {d.sales > 0 && d.purchases > 0 ? 'Both' : d.sales > 0 ? 'Customer' : 'Supplier'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
