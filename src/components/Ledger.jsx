// Searchable, sortable, filterable, inline-editable transaction ledger.

import { useMemo, useState } from 'react';
import { fmtN, fmtNI } from '../lib/format.js';

const COLUMNS = [
  { key: 'date',        label: 'Date' },
  { key: 'type',        label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'category',    label: 'Category' },
  { key: 'counterparty',label: 'Counterparty' },
  { key: 'qty',         label: 'Qty',    num: true },
  { key: 'vatRate',     label: 'VAT %',  num: true },
  { key: 'net',         label: 'Net (₦)',   num: true },
  { key: 'vat',         label: 'VAT (₦)',   num: true },
  { key: 'gross',       label: 'Gross (₦)', num: true },
];

// Editable fields and their input type
const EDITABLE = {
  description: 'text',
  category:    'text',
  counterparty:'text',
  qty:         'number',
  unitPrice:   'number',
  vatRate:     'number',
  whtRate:     'number',
};

function EditableCell({ value, field, rowIndex, onRowChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  if (!EDITABLE[field]) return <span>{value}</span>;

  if (!editing) {
    return (
      <span
        className="cursor-pointer hover:text-saffron hover:underline decoration-dotted underline-offset-2 transition-colors"
        title="Click to edit"
        onClick={() => { setDraft(String(value)); setEditing(true); }}
      >
        {value}
      </span>
    );
  }

  const commit = () => {
    const parsed = EDITABLE[field] === 'number' ? parseFloat(draft) : draft.trim();
    if (!isNaN(parsed) || EDITABLE[field] === 'text') onRowChange(rowIndex, field, parsed);
    setEditing(false);
  };

  return (
    <input
      autoFocus
      type={EDITABLE[field]}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
      className="input-base w-full text-right py-0.5 px-1 text-[12px]"
      style={{ minWidth: 60 }}
    />
  );
}

export default function Ledger({ rows, onRowChange }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const categories = useMemo(() => [...new Set(rows.map((r) => r.category))].sort(), [rows]);

  const filtered = useMemo(() => {
    let out = rows.map((r, originalIndex) => ({ ...r, _idx: originalIndex }));
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((r) => (r.description + r.counterparty + r.invoiceNo + r.category).toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') out = out.filter((r) => r.type === typeFilter);
    if (categoryFilter !== 'all') out = out.filter((r) => r.category === categoryFilter);
    out.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return out;
  }, [rows, query, typeFilter, categoryFilter, sortKey, sortDir]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('desc'); }
  };

  return (
    <div className="bg-ink-2 border border-line-soft rounded-[14px] overflow-hidden animate-fadeUp print-card">
      <div className="px-[22px] py-[18px] flex gap-3 items-center justify-between border-b border-line-soft no-print max-md:flex-col max-md:items-start">
        <div className="flex gap-2.5 items-center flex-1 flex-wrap">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by description, customer, invoice…"
            className="input-base min-w-[240px] flex-1"
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-base">
            <option value="all">All types</option>
            <option value="Sale">Sales only</option>
            <option value="Purchase">Purchases only</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-base">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted whitespace-nowrap">{filtered.length} of {rows.length} rows</span>
          <span className="font-mono text-[10px] text-muted-2 no-print">Click a cell to edit</span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={
                    'sort-th text-left p-3.5 font-medium text-[11px] tracking-wider uppercase text-muted border-b border-line bg-ink-3 cursor-pointer select-none hover:text-saffron print-th ' +
                    (col.num ? 'text-right' : '') +
                    (sortKey === col.key ? ' sorted' : '') +
                    (sortKey === col.key && sortDir === 'asc' ? ' asc' : '')
                  }
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r._idx} className={`hover:bg-white/[0.025] ${i % 2 === 0 ? '' : 'bg-white/[0.012]'}`}>
                <td className="p-3.5 border-b border-line-soft text-bone-2 print-td">{r.date}</td>
                <td className="p-3.5 border-b border-line-soft print-td">
                  <span className={
                    'inline-block px-2.5 py-0.5 rounded text-[10.5px] font-semibold tracking-wider uppercase border ' +
                    (r.type === 'Sale' ? 'bg-sage/[0.12] text-sage border-sage/25' : 'bg-brick/[0.12] text-brick border-brick/25')
                  }>
                    {r.type}
                  </span>
                  {r.vatExempt && (
                    <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9.5px] font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/25">EXEMPT</span>
                  )}
                </td>
                <td className="p-3.5 border-b border-line-soft text-bone-2 print-td">
                  <EditableCell value={r.description} field="description" rowIndex={r._idx} onRowChange={onRowChange} />
                </td>
                <td className="p-3.5 border-b border-line-soft text-bone-2 print-td">
                  <EditableCell value={r.category} field="category" rowIndex={r._idx} onRowChange={onRowChange} />
                </td>
                <td className="p-3.5 border-b border-line-soft text-bone-2 print-td">
                  <EditableCell value={r.counterparty} field="counterparty" rowIndex={r._idx} onRowChange={onRowChange} />
                  {r.vatWithheld && (
                    <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[9.5px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/25">WHT</span>
                  )}
                </td>
                <td className="p-3.5 border-b border-line-soft text-bone-2 font-mono text-right text-[13px] print-td">
                  <EditableCell value={r.qty} field="qty" rowIndex={r._idx} onRowChange={onRowChange} />
                </td>
                <td className="p-3.5 border-b border-line-soft text-bone-2 font-mono text-right text-[13px] print-td">
                  {r.vatRate}%
                </td>
                <td className="p-3.5 border-b border-line-soft text-bone-2 font-mono text-right text-[13px] print-td">{fmtN(r.net)}</td>
                <td className="p-3.5 border-b border-line-soft text-bone-2 font-mono text-right text-[13px] print-td">{fmtN(r.vat)}</td>
                <td className="p-3.5 border-b border-line-soft text-bone-2 font-mono text-right text-[13px] print-td">{fmtN(r.gross)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
