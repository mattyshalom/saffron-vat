// Horizontal bar of top 7 items by net revenue (sales only).

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { aggregateByItem } from '../../lib/compute.js';
import { CHART_COLORS as C } from '../../lib/chartConfig.js';
import { fmtN, fmtNI } from '../../lib/format.js';

export default function TopItemsChart({ rows }) {
  const { data, options } = useMemo(() => {
    const top = aggregateByItem(rows).slice(0, 7);
    return {
      data: {
        labels: top.map((t) => t.name),
        datasets: [
          {
            data: top.map((t) => t.revenue),
            backgroundColor: C.saffron,
            borderRadius: 4,
            barThickness: 'flex',
            maxBarThickness: 26,
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
            callbacks: { label: (c) => ` ₦${fmtN(c.parsed.x)} revenue` },
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
