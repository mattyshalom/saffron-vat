// Number formatting utilities for Naira display.

const FMT = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const FMT_INT = new Intl.NumberFormat('en-NG', {
  maximumFractionDigits: 0,
});

/** Format a number with two decimal places (e.g. 12345.6 -> "12,345.60"). */
export const fmtN = (n) => FMT.format(n ?? 0);

/** Format a number as a rounded integer (e.g. 12345.6 -> "12,346"). */
export const fmtNI = (n) => FMT_INT.format(Math.round(n ?? 0));

/** Escape HTML in user-supplied strings before injecting into DOM. */
export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
