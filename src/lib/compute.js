// VAT + WHT computation engine.

const sumNet = (rows) => rows.reduce((s, r) => s + r.net, 0);
const sumVat = (rows) => rows.reduce((s, r) => s + r.vat, 0);
const sumWht = (rows) => rows.reduce((s, r) => s + r.whtAmount, 0);

export const computeSummary = (rows) => {
  const sales = rows.filter((r) => r.type === 'Sale');
  const purch = rows.filter((r) => r.type === 'Purchase');

  const taxableSales = sumNet(sales.filter((r) => !r.vatExempt));
  const exemptSales  = sumNet(sales.filter((r) => r.vatExempt));
  const taxablePurch = sumNet(purch);

  const outputVat = sumVat(sales);
  const inputVat  = sumVat(purch);

  const outputVatWithheld = sales.filter((r) => r.vatWithheld).reduce((s, r) => s + r.vat, 0);
  const outputVatDue = outputVat - outputVatWithheld;
  const netVat = outputVatDue - inputVat;

  // WHT: amounts withheld from supplier payments (purchases) that you must remit to FIRS.
  // whtOnSales = WHT customers deducted from your sales income (reduces your cash received).
  const whtOnSales     = sumWht(sales);
  const whtOnPurchases = sumWht(purch);

  const vatRates = [...new Set(rows.map((r) => r.vatRate).filter((r) => r > 0))].sort((a, b) => a - b);
  const rateLabel = vatRates.length === 0 ? '0%' : vatRates.length === 1 ? `${vatRates[0]}%` : vatRates.map((r) => `${r}%`).join(', ');

  const dates = rows.map((r) => r.date).sort();
  const first = dates[0] || '';
  const last  = dates[dates.length - 1] || '';
  const period = first
    ? new Date(first).toLocaleString('en-NG', { month: 'long', year: 'numeric' })
    : '—';

  return {
    sales, purch,
    taxableSales, exemptSales, taxablePurch,
    outputVat, outputVatWithheld, outputVatDue,
    inputVat, netVat,
    whtOnSales, whtOnPurchases,
    rateLabel, period, first, last,
  };
};

export const aggregateByItem = (rows) => {
  const sales = rows.filter((r) => r.type === 'Sale');
  const map = {};
  sales.forEach((r) => {
    if (!map[r.description]) map[r.description] = { revenue: 0, qty: 0, vat: 0, txns: 0 };
    map[r.description].revenue += r.net;
    map[r.description].qty    += r.qty;
    map[r.description].vat    += r.vat;
    map[r.description].txns   += 1;
  });
  return Object.entries(map)
    .map(([name, m]) => ({ name, ...m }))
    .sort((a, b) => b.revenue - a.revenue);
};

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

export const aggregateByDate = (rows) => {
  const map = {};
  rows.forEach((r) => {
    if (!map[r.date]) map[r.date] = { revenue: 0, vat: 0 };
    if (r.type === 'Sale') {
      map[r.date].revenue += r.net;
      map[r.date].vat     += r.vat;
    }
  });
  return Object.keys(map).sort().map((d) => ({ date: d, ...map[d] }));
};

/** Aggregate totals per counterparty for the counterparty summary panel. */
export const aggregateByCounterparty = (rows) => {
  const map = {};
  rows.forEach((r) => {
    if (!map[r.counterparty]) {
      map[r.counterparty] = { counterparty: r.counterparty, sales: 0, purchases: 0, outputVat: 0, inputVat: 0, wht: 0, txns: 0, isAgent: false };
    }
    const m = map[r.counterparty];
    m.txns += 1;
    if (r.type === 'Sale') {
      m.sales     += r.net;
      m.outputVat += r.vat;
      if (r.vatWithheld) m.isAgent = true;
    } else {
      m.purchases += r.net;
      m.inputVat  += r.vat;
    }
    m.wht += r.whtAmount;
  });
  return Object.values(map).sort((a, b) => (b.sales + b.purchases) - (a.sales + a.purchases));
};

export const buildFilingCSV = (rows, summary) => {
  const lines = [];
  lines.push('SAFFRON VAT FILING SUMMARY');
  lines.push(`Period,${summary.period}`);
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push('');
  lines.push('Item,Amount (NGN)');
  lines.push(`Total taxable sales,${summary.taxableSales.toFixed(2)}`);
  lines.push(`VAT-exempt sales,${summary.exemptSales.toFixed(2)}`);
  lines.push(`Output VAT charged (all),${summary.outputVat.toFixed(2)}`);
  lines.push(`  Of which withheld by VAT-agent customers,${summary.outputVatWithheld.toFixed(2)}`);
  lines.push(`Output VAT you must remit,${summary.outputVatDue.toFixed(2)}`);
  lines.push(`Total taxable purchases,${summary.taxablePurch.toFixed(2)}`);
  lines.push(`Input VAT recoverable,${summary.inputVat.toFixed(2)}`);
  lines.push(`Net VAT payable to FIRS,${summary.netVat.toFixed(2)}`);
  lines.push(`WHT withheld from your sales income,${summary.whtOnSales.toFixed(2)}`);
  lines.push(`WHT you withheld from suppliers (to remit),${summary.whtOnPurchases.toFixed(2)}`);
  lines.push(`VAT rate(s) in use,${summary.rateLabel}`);
  lines.push(`Number of sales invoices,${summary.sales.length}`);
  lines.push(`Number of purchase invoices,${summary.purch.length}`);
  lines.push('');
  lines.push('TRANSACTION DETAIL');
  lines.push('Date,Type,Description,Category,Counterparty,InvoiceNo,Qty,UnitPrice,VATRate,VATExempt,VATWithheld,WHTRate,Net,VAT,WHT,Gross');
  const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
  rows.forEach((r) => {
    lines.push([
      r.date, r.type,
      q(r.description), q(r.category), q(r.counterparty), q(r.invoiceNo),
      r.qty, r.unitPrice, r.vatRate,
      r.vatExempt  ? 'Y' : '',
      r.vatWithheld ? 'Y' : '',
      r.whtRate || '',
      r.net.toFixed(2), r.vat.toFixed(2), r.whtAmount.toFixed(2), r.gross.toFixed(2),
    ].join(','));
  });
  return lines.join('\n');
};
