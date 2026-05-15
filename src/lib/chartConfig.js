// Centralized Chart.js registration + shared theme constants.
// Importing this once at app boot registers the controllers we use.

import {
  Chart,
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

// Set global defaults so individual charts stay terse.
Chart.defaults.font.family = 'Manrope, system-ui, sans-serif';
Chart.defaults.font.size = 11;
Chart.defaults.color = '#8a93a3';

export const CHART_COLORS = {
  saffron: '#e8b84e',
  saffronDeep: '#c9962a',
  emerald: '#5fa074',
  crimson: '#c45c4a',
  azure: '#5b8cb8',
  plum: '#9a6fae',
  bone: '#f4ede1',
  muted: '#8a93a3',
  grid: 'rgba(138,147,163,0.1)',
  ink: '#0d1117',
  ink2: '#141b24',
};
