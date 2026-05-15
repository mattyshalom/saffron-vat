// Sales-vs-purchases doughnut. Saffron = sales, crimson = purchases.

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useThemeColors } from '../../lib/useThemeColors.js';
import { fmtN } from '../../lib/format.js';

export default function SplitChart({ summary }) {
  const C = useThemeColors();

  const { data, options } = useMemo(() => ({
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
          titleColor: C.tooltipTitle,
          bodyColor: C.tooltipBody,
          callbacks: { label: (c) => ` ${c.label}: ₦${fmtN(c.parsed)}` },
        },
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [summary.taxableSales, summary.taxablePurch, C]);

  return <Doughnut data={data} options={options} />;
}
