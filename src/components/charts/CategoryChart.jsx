// Horizontal bar of VAT generated per (type · category).
// Sales bars are saffron, purchase bars are crimson, sorted descending.

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { aggregateByCategory } from '../../lib/compute.js';
import { CHART_COLORS as C } from '../../lib/chartConfig.js';
import { fmtN, fmtNI } from '../../lib/format.js';

export default function CategoryChart({ rows }) {
  const { data, options } = useMemo(() => {
    const agg = aggregateByCategory(rows);
    const labels = agg.map((a) => a.key);
    return {
      data: {
        labels,
        datasets: [
          {
            data: agg.map((a) => a.vat),
            backgroundColor: labels.map((l) => (l.startsWith('S') ? C.saffron : C.crimson)),
            borderRadius: 4,
            barThickness: 'flex',
            maxBarThickness: 28,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: C.ink,
            borderColor: C.saffron,
            borderWidth: 1,
            callbacks: { label: (c) => ` ₦${fmtN(c.parsed.x)} VAT` },
          },
        },
        scales: {
          x: {
            ticks: { color: C.muted, callback: (v) => '₦' + fmtNI(v) },
            grid: { color: C.grid },
          },
          y: { ticks: { color: C.bone }, grid: { display: false } },
        },
      },
    };
  }, [rows]);

  return <Bar data={data} options={options} />;
}
