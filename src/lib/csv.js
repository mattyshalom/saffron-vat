// CSV parsing & row normalization.
// Accepts case-insensitive header variations to be friendly to messy real-world CSVs.

import Papa from 'papaparse';

/** Find the first matching key in `raw` for any of the candidate names (case + separator insensitive). */
const pick = (raw, candidates) => {
  const norm = (s) => String(s).toLowerCase().replace(/[\s_-]/g, '');
  for (const c of candidates) {
    const target = norm(c);
    for (const k of Object.keys(raw)) {
      if (norm(k) === target) return raw[k];
    }
  }
  return '';
};

const flag = (raw, candidates) => {
  const v = String(pick(raw, candidates) || '').trim().toUpperCase();
  return v === 'Y' || v === 'YES' || v === '1';
};

/** Convert a raw CSV row into a normalized transaction object, or null if invalid. */
const normalizeRow = (raw) => {
  const date = pick(raw, ['Date', 'TransactionDate', 'TxnDate']);
  if (!date) return null;

  const type = String(pick(raw, ['Type', 'TransactionType']) || '').trim();
  if (!['Sale', 'Purchase'].includes(type)) return null;

  const qty = parseFloat(pick(raw, ['Quantity', 'Qty'])) || 1;
  const unitPrice =
    parseFloat(String(pick(raw, ['UnitPrice', 'Price', 'Amount']) || '0').replace(/,/g, '')) || 0;

  const vatExempt = flag(raw, ['VATExempt', 'Exempt', 'ZeroRated', 'VatExempt']);
  const rateRaw = parseFloat(pick(raw, ['VATRate', 'VAT', 'Rate']));
  const vatRate = vatExempt ? 0 : isNaN(rateRaw) ? 7.5 : rateRaw;

  const net = qty * unitPrice;
  const vat = net * (vatRate / 100);
  const gross = net + vat;

  const vatWithheld = flag(raw, ['VATWithheld', 'VatWithheld', 'WHTVat', 'WithheldVAT']);

  const whtRateRaw = parseFloat(pick(raw, ['WHTRate', 'WHT', 'WithholdingTax', 'WHTax']));
  const whtRate = isNaN(whtRateRaw) ? 0 : whtRateRaw;
  const whtAmount = net * (whtRate / 100);

  return {
    date,
    type,
    description: pick(raw, ['Description', 'Item', 'Product']) || '—',
    category: pick(raw, ['Category', 'Cat']) || 'Uncategorized',
    qty,
    unitPrice,
    vatRate,
    vatExempt,
    vatWithheld,
    whtRate,
    whtAmount,
    counterparty: pick(raw, ['Counterparty', 'Customer', 'Supplier', 'Vendor']) || '—',
    invoiceNo: pick(raw, ['InvoiceNo', 'Invoice', 'InvoiceNumber', 'Ref']) || '—',
    net,
    vat,
    gross,
  };
};

/** Parse a CSV string into an array of normalized transaction rows. */
export const parseCSV = (text) => {
  const result = Papa.parse(text.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (result.errors?.length) {
    // eslint-disable-next-line no-console
    console.warn('CSV parse warnings:', result.errors);
  }
  return result.data.map(normalizeRow).filter(Boolean);
};

/** Read a File object as text and parse it. Returns a Promise of rows. */
export const readFileAsRows = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(parseCSV(e.target.result));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
