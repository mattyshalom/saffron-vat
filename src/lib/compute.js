// VAT computation engine.
// Splits rows into sales/purchases, totals net + VAT, and derives the FIRS-style summary.

const sumNet = (rows) => rows.reduce((s, r) => s + r.net, 0);
const sumVat = (rows) => rows.reduce((s, r) => s + r.vat, 0);

/** Compute the full summary for a set of transactions. */
export const computeSummary = (rows) => {
  const sales = rows.filter((r) => r.type === 'Sale');
  const purch = rows.filter((r) => r.type === 'Purchase');

  const taxableSales = sumNet(sales);
  const taxablePurch = sumNet(purch);
  const outputVat = sumVat(sales);
  const inputVat = sumVat(purch);

  // VAT withheld at source by VAT-withholding-agent customers (already remitted to FIRS on your TIN).
  const outputVatWithheld = sales.filter((r) => r.vatWithheld).reduce((s, r) => s + r.vat, 0);
  // Only the portion you collected yourself needs to be remitted.
  const outputVatDue = outputVat - outputVatWithheld;
  const netVat = outputVatDue - inputVat;

  const vatRates = [...new Set(rows.map((r) => r.vatRate))].sort((a, b) => a - b);
  const rateLabel = vatRates.length === 1 ? `${vatRates[0]}%` : vatRates.map((r) => `${r}%`).join(', ');

  const dates = rows.map((r) => r.date).sort();
  const first = dates[0] || '';
  const last = dates[dates.length - 1] || '';
  const period = first
    ? new Date(first).toLocaleString('en-NG', { month: 'long', year: 'numeric' })
    : '—';

  return {
    sales,
    purch,
    taxableSales,
    taxablePurch,
    outputVat,
    outputVatWithheld,
    outputVatDue,
    inputVat,
    netVat,
    rateLabel,
    period,
    first,
    last,
  };
};

/** Aggregate sales by item description (used by ranking + top-items chart). */
export const aggregateByItem = (rows) => {
  const sales = rows.filter((r) => r.type === 'Sale');
  const map = {};
  sales.forEach((r) => {
    if (!map[r.description]) map[r.description] = { revenue: 0, qty: 0, vat: 0, txns: 0 };
    map[r.description].revenue += r.net;
    map[r.description].qty += r.qty;
    map[r.description].vat += r.vat;
    map[r.description].txns += 1;
  });
  return Object.entries(map)
    .map(([name, m]) => ({ name, ...m }))
    .sort((a, b) => b.revenue - a.revenue);
};

/** Aggregate VAT by category, prefixed S· for sales / P· for purchases. */
export const aggregateByCategory = (rows) => {
  const map = {};
  rows.forEach((r) => {
    const k = (r.type === 'Sale' ? 'S · ' : 'P · ') + r.category;
    map[k] = (map[k] || 0) + r.vat;
  });
  return Object.entries(map)
    .map(([key, vat]) => ({ key, vat }))
    .sort((a, b) => b.vat - a.vat);
};

/** Aggregate revenue + VAT by date for the trend chart. */
export const aggregateByDate = (rows) => {
  const map = {};
  rows.forEach((r) => {
    if (!map[r.date]) map[r.date] = { revenue: 0, vat: 0 };
    if (r.type === 'Sale') {
      map[r.date].revenue += r.net;
      map[r.date].vat += r.vat;
    }
  });
  return Object.keys(map)
    .sort()
    .map((d) => ({ date: d, ...map[d] }));
};

/**
 * Build CSV text for a filing-ready export.
 * Returns a string suitable for Blob download.
 */
export const buildFilingCSV = (rows, summary) => {
  const lines = [];
  lines.push('SAFFRON VAT FILING SUMMARY');
  lines.push(`Period,${summary.period}`);
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push('');
  lines.push('Item,Amount (NGN)');
  lines.push(`Total taxable sales,${summary.taxableSales.toFixed(2)}`);
  lines.push(`Output VAT charged (all),${summary.outputVat.toFixed(2)}`);
  lines.push(`  Of which withheld by VAT-agent customers,${summary.outputVatWithheld.toFixed(2)}`);
  lines.push(`Output VAT you must remit,${summary.outputVatDue.toFixed(2)}`);
  lines.push(`Total taxable purchases,${summary.taxablePurch.toFixed(2)}`);
  lines.push(`Input VAT recoverable,${summary.inputVat.toFixed(2)}`);
  lines.push(`Net VAT payable to FIRS,${summary.netVat.toFixed(2)}`);
  lines.push(`VAT rate(s) in use,${summary.rateLabel}`);
  lines.push(`Number of sales invoices,${summary.sales.length}`);
  lines.push(`Number of purchase invoices,${summary.purch.length}`);
  lines.push('');
  lines.push('TRANSACTION DETAIL');
  lines.push(
    'Date,Type,Description,Category,Counterparty,InvoiceNo,Qty,UnitPrice,VATRate,Net,VAT,Gross,VATWithheld',
  );
  const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
  rows.forEach((r) => {
    lines.push(
      [
        r.date,
        r.type,
        q(r.description),
        q(r.category),
        q(r.counterparty),
        q(r.invoiceNo),
        r.qty,
        r.unitPrice,
        r.vatRate,
        r.net.toFixed(2),
        r.vat.toFixed(2),
        r.gross.toFixed(2),
        r.vatWithheld ? 'Y' : '',
      ].join(','),
    );
  });
  return lines.join('\n');
};
