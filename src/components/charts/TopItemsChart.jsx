// Horizontal bar of top 7 items by net revenue (sales only).

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { aggregateByItem } from '../../lib/compute.js';
import { useThemeColors } from '../../lib/useThemeColors.js';
import { fmtN, fmtNI } from '../../lib/format.js';

export default function TopItemsChart({ rows }) {
  const C = useThemeColors();

  const { data, options } = useMemo(() => {
    const top = aggregateByItem(rows).slice(0, 7);
    // Gradient of saffron shades from darkest to lightest
    const shades = top.map((_, i) => {
      const opacity = 1 - i * 0.1;
      return C.saffron + Math.round(opacity * 255).toString(16).padStart(2, '0');
    });
    return {
      data: {
        labels: top.map((t) => t.name),
        datasets: [
          {
            data: top.map((t) => t.revenue),
            backgroundColor: shades,
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
            titleColor: C.tooltipTitle,
            bodyColor: C.tooltipBody,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, C]);

  return <Bar data={data} options={options} />;
}
