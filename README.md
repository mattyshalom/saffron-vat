# Saffron — VAT for Nigerian businesses

A focused dashboard that turns a CSV of monthly transactions into a filing-ready VAT return. Computes Output VAT, Input VAT, and the Net amount payable to FIRS at the standard 7.5% rate, ranks your top-selling items, and renders the whole thing as a printable PDF.

Single-page React app. No backend. All processing happens in the browser — your transactions never leave the device.

## Why it exists

Most small Nigerian businesses prep their monthly VAT return in a spreadsheet, eyeball the totals, and hope. Saffron does the math the same way the FIRS Act expects, shows you which products are actually carrying the business, and gives you a draft return you can use as the basis for your filing on TaxPro-Max.

Things it deliberately does **not** do:
- File on your behalf
- Persist data anywhere (no DB, no cloud)
- Handle multi-rate or zero-rated edge cases (yet)
- Multi-tenant / multi-user

If you need any of those, the code is small enough to fork and extend.

---

## Quick start

```bash
git clone <your-fork-url>
cd saffron-vat
npm install
npm run dev
```

Then open http://localhost:5173 and click **Try sample** to see the dashboard with example data.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Produce a production bundle in `dist/` |
| `npm run preview` | Serve the built bundle locally to sanity-check |

### Requirements

Node 18+ and npm 9+. No other system dependencies.

---

## Deploying

The repo ships with config for both major static hosts. The build output is just static files — anywhere that can serve HTML will work.

### Netlify

Either drag the `dist/` folder onto netlify.com, or connect the repo. `netlify.toml` is already in the root and tells Netlify to run `npm run build` and publish `dist/`. The SPA redirect rule is included so deep links work.

### Vercel

Connect the repo. Vercel auto-detects Vite, but `vercel.json` is included to make it explicit and to set up SPA rewrites.

### GitHub Pages

```bash
npm run build
# push the dist/ folder to a gh-pages branch (e.g. with the gh-pages package)
```

You'll need to set Vite's `base` option in `vite.config.js` to your repo name if you're not deploying to the root.

---

## CSV schema

Header names are matched case-insensitively and ignore underscores/dashes/spaces, so `unit_price` and `Unit Price` both work as `UnitPrice`.

| Column | Required | Notes |
| --- | --- | --- |
| `Date` | yes | ISO-ish (`2026-05-01` works) |
| `Type` | yes | `Sale` or `Purchase` |
| `Description` | recommended | Item or plan name — drives the rankings |
| `Category` | recommended | Free text — drives the category chart and ledger filter |
| `Quantity` | yes | Defaults to 1 if missing |
| `UnitPrice` | yes | **Net (VAT-exclusive) price** in NGN |
| `VATRate` | optional | Defaults to 7.5 |
| `Counterparty` | optional | Customer for sales, supplier for purchases |
| `InvoiceNo` | optional | For your records |

The engine derives `Net = Qty × UnitPrice`, `VAT = Net × Rate%`, `Gross = Net + VAT`. A sample CSV is in `public/sample_transactions.csv`.

---

## Project structure

```
saffron-vat/
├── public/
│   └── sample_transactions.csv     # Downloadable example for users
├── src/
│   ├── main.jsx                    # React entry — registers Chart.js, mounts <App>
│   ├── App.jsx                     # Top-level state: rows, summary, callbacks
│   ├── index.css                   # Tailwind directives + base/print styles
│   ├── data/
│   │   └── sample.js               # Sample CSV embedded as a JS string
│   ├── lib/
│   │   ├── csv.js                  # Papa Parse wrapper + row normalization
│   │   ├── compute.js              # VAT math + aggregations + filing CSV builder
│   │   ├── format.js               # Naira formatters + HTML escape
│   │   └── chartConfig.js          # Chart.js controller registration + theme palette
│   └── components/
│       ├── Header.jsx              # Top bar: brand, period, action buttons
│       ├── Hero.jsx                # Editorial headline + period meta block
│       ├── UploadZone.jsx          # Drag/drop file picker + "use sample"
│       ├── Ribbon.jsx              # Compact metadata strip
│       ├── KpiStrip.jsx            # The four headline numbers
│       ├── TopRanking.jsx          # Bar-style ranked list of items
│       ├── Ledger.jsx              # Searchable + sortable transaction table
│       ├── ReturnSummary.jsx       # FIRS-style filing snapshot card
│       ├── Toast.jsx               # Tiny ephemeral notification
│       ├── Footer.jsx              # Sign-off line
│       └── charts/
│           ├── TrendChart.jsx      # Daily revenue + VAT line chart
│           ├── SplitChart.jsx      # Sales vs purchases doughnut
│           ├── CategoryChart.jsx   # VAT by category horizontal bar
│           └── TopItemsChart.jsx   # Top 7 items by revenue horizontal bar
├── index.html                      # Vite HTML shell + Google Fonts links
├── tailwind.config.js              # Custom palette (ink/saffron/bone) + fonts
├── postcss.config.js               # Tailwind + autoprefixer
├── vite.config.js                  # Vite + React plugin
├── netlify.toml                    # Netlify build + SPA redirects
├── vercel.json                     # Vercel build + SPA rewrites
└── package.json
```

---

## Component-by-component walk-through

A short tour of what each file does and why it exists.

### Entry point

**`main.jsx`** — Standard React 18 entry. Imports `chartConfig.js` once for its side effects (registers the Chart.js controllers globally) so individual chart components don't have to.

**`App.jsx`** — The orchestrator. It owns the `rows` array (parsed transactions) and a `toast` string. Everything else is derived: `summary` is computed via `useMemo`, filtering happens locally inside `<Ledger>`, charts derive their data from props. Three callbacks (`handleFile`, `loadSample`, `handleExportCSV`) are passed down. The empty state shows `<UploadZone>`; the loaded state shows the dashboard.

### Lib / utilities

**`lib/csv.js`** — Wraps Papa Parse and normalizes raw CSV objects into transaction shapes. The `pick()` helper does case-insensitive, separator-insensitive header matching so user CSVs don't have to be perfectly formatted. Returns `null` for invalid rows so they get filtered out.

**`lib/compute.js`** — Pure functions, no React. `computeSummary()` produces the headline numbers and detects the reporting period from the date range. `aggregateByItem`, `aggregateByCategory`, `aggregateByDate` feed the visualizations. `buildFilingCSV()` produces the export string.

**`lib/format.js`** — `Intl.NumberFormat` wrappers for Naira display. `escapeHtml` is included for any future feature that injects HTML.

**`lib/chartConfig.js`** — Registering Chart.js controllers tree-shakeably means each chart only ships what it uses. Done once here; sets global defaults (font, color) and exports a shared color palette so chart components stay consistent.

### Components

**`Header.jsx`** — Brand mark + tagline + action pills. The brand mark is a CSS-only ₦ on a saffron gradient — keeps the bundle free of image assets. Hidden in print.

**`Hero.jsx`** — The "Tax season, without the dread." line. Big serif, italicised accent in saffron. Gives the page a point of view before the data arrives.

**`UploadZone.jsx`** — Drag/drop + click-to-browse + "use sample" shortcut. Local `dragging` state for the visual hover effect. The schema hint at the bottom doubles as inline documentation.

**`Ribbon.jsx`** — A row of mono-font chips above the KPI strip. Acts as data provenance: where do these numbers come from?

**`KpiStrip.jsx`** — Four equal cells, separated by 1px dividers (achieved via a 1-pixel gap on a tinted background). The third tile (`Net VAT Payable`) gets a `feature` flag that paints it saffron — that's the number the user actually came for.

**`TopRanking.jsx`** — Each row is a 3-column grid: rank number, name+bar, metadata. Bars are scaled relative to the top performer, animated in via a CSS transition on `width`.

**`Ledger.jsx`** — Owns its own filter/search/sort state with `useState`. All transformations are memo-ised on the source rows. Sorting toggles direction when re-clicking the same column. Sticky max-height + overflow-y means the page stays a sensible length even with hundreds of transactions.

**`ReturnSummary.jsx`** — A `<Row>` sub-component prints label/value pairs in a filing-document style. The total row gets a saffron top border + tinted background to read like the bottom line of an invoice. Print styles preserve the look in PDF exports.

**`Toast.jsx`** — A single fixed-position div with a CSS transition. Mounted always; toggles a class.

**`Footer.jsx`** — Two short lines, mono font, low contrast. Sets a quiet ending.

### Charts

All four chart components follow the same pattern: `useMemo` over the rows prop, build `data` and `options`, render via `react-chartjs-2`. They share the palette from `chartConfig.js`. Tooltips are styled to match the dashboard (saffron border on dark background) so the chart feels native to the page rather than imported from a generic library.

---

## Design choices worth noting

**Why a single user-facing CSV format instead of an import wizard?** Wizards are great when CSV shapes vary wildly. For one business filing one return, we control the format — so we just document it and accept reasonable header variations.

**Why not store data in `localStorage`?** A VAT app needs to feel trustworthy. The "no data leaves your device" line in the footer is true precisely because we don't persist. If you add multi-month history later, do it explicitly.

**Why client-side everything?** Filing a Nigerian VAT return means the math has to be right and easy to audit, not fancy. The whole engine is ~80 lines in `compute.js` — you can read and verify it in five minutes.

**Why Tailwind plus a few hand-rolled CSS rules?** Tailwind covers 95% of the layout efficiently. The remaining 5% (toast animation, sortable table arrows, print styles) is clearer as plain CSS in `index.css` than as Tailwind plugin config.

---

## Roadmap (if anyone wants to extend)

- Multi-period view: keep last N months and chart the trend
- Multi-rate support: handle zero-rated, exempt, and reverse-charge entries
- Saved drafts via OPFS / IndexedDB (still no server)
- Branded invoice export (PDF) for individual sale rows
- A small backend wrapper for accountants who manage many businesses

---

## License

MIT. See `LICENSE`.
