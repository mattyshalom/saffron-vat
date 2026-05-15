// Daily revenue + VAT trend (line chart, two series).

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { aggregateByDate } from '../../lib/compute.js';
import { useThemeColors } from '../../lib/useThemeColors.js';
import { fmtN, fmtNI } from '../../lib/format.js';

export default function TrendChart({ rows }) {
  const C = useThemeColors();

  const { data, options } = useMemo(() => {
    const agg = aggregateByDate(rows);
    const labels = agg.map((d) =>
      new Date(d.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
    );
    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue (net)',
            data: agg.map((d) => d.revenue),
            borderColor: C.saffron,
            backgroundColor: C.saffron + '22',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2.5,
          },
          {
            label: 'VAT collected',
            data: agg.map((d) => d.vat),
            borderColor: C.emerald,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2,
            borderDash: [4, 4],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: C.bone, usePointStyle: true, padding: 16 },
          },
          tooltip: {
            backgroundColor: C.ink,
            borderColor: C.saffron,
            borderWidth: 1,
            titleColor: C.tooltipTitle,
            bodyColor: C.tooltipBody,
            padding: 12,
            callbacks: { label: (c) => ` ${c.dataset.label}: ₦${fmtN(c.parsed.y)}` },
          },
        },
        scales: {
          x: { ticks: { color: C.muted }, grid: { color: C.grid } },
          y: {
            ticks: { color: C.muted, callback: (v) => '₦' + fmtNI(v) },
            grid: { color: C.grid },
          },
        },
      },
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, C]);

  return <Line data={data} options={options} />;
}
