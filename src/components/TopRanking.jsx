// Ranked list of items with a horizontal bar relative to the top performer.
// Shows revenue, units sold, transaction count and VAT generated per item.

import { useMemo } from 'react';
import { aggregateByItem } from '../lib/compute.js';
import { fmtN, fmtNI } from '../lib/format.js';

export default function TopRanking({ rows }) {
  const items = useMemo(() => aggregateByItem(rows), [rows]);
  const max = items[0]?.revenue || 1;

  if (!items.length) {
    return (
      <p className="text-muted text-center py-5">No sale items to rank.</p>
    );
  }

  return (
    <div>
      {items.map((m, i) => {
        const pct = (m.revenue / max) * 100;
        return (
          <div
            key={m.name}
            className="grid grid-cols-[24px_1fr_auto] gap-3.5 items-center py-3 border-b border-line-soft last:border-none"
          >
            <div className="font-display italic text-lg text-saffron text-center">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-bone font-medium mb-1.5 truncate">{m.name}</div>
              <div className="h-[5px] bg-ink-3 rounded-[3px] overflow-hidden">
                <div
                  className="h-full rounded-[3px] transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, rgb(var(--saffron-rgb)), rgb(var(--saffron-deep-rgb)))',
                  }}
                />
              </div>
            </div>
            <div className="font-mono text-xs text-muted text-right whitespace-nowrap">
              <span className="block text-bone text-[13px]">₦{fmtN(m.revenue)}</span>
              {fmtNI(m.qty)} sold · {m.txns} txns · ₦{fmtN(m.vat)} VAT
            </div>
          </div>
        );
      })}
    </div>
  );
}
