// Sales-vs-purchases doughnut. Saffron = sales, brick = purchases.

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { CHART_COLORS as C } from '../../lib/chartConfig.js';
import { fmtN } from '../../lib/format.js';

export default function SplitChart({ summary }) {
  const { data, options } = useMemo(
    () => ({
      data: {
        labels: ['Sales (output)', 'Purchases (input)'],
        datasets: [
          {
            data: [summary.taxableSales, summary.taxablePurch],
            backgroundColor: [C.saffron, C.crimson],
            borderColor: C.ink2,
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: C.bone, usePointStyle: true, padding: 14 },
          },
          tooltip: {
            backgroundColor: C.ink,
            borderColor: C.saffron,
            borderWidth: 1,
            callbacks: { label: (c) => ` ${c.label}: ₦${fmtN(c.parsed)}` },
          },
        },
      },
    }),
    [summary.taxableSales, summary.taxablePurch],
  );

  return <Doughnut data={data} options={options} />;
}
