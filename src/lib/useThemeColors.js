// Returns the correct chart color palette for the active theme.
// Watches data-theme attribute changes via MutationObserver so charts re-render on toggle.

import { useState, useEffect } from 'react';

const DARK = {
  saffron:    '#e8b84e',
  saffronDeep:'#c9962a',
  emerald:    '#5fa074',
  crimson:    '#c45c4a',
  azure:      '#5b8cb8',
  plum:       '#9a6fae',
  bone:       '#f4ede1',
  muted:      '#8a93a3',
  grid:       'rgba(138,147,163,0.12)',
  ink:        '#0d1117',
  ink2:       '#141b24',
  tooltipTitle:'#f4ede1',
  tooltipBody: '#c8c0b0',
};

const LIGHT = {
  saffron:    '#b06a00',
  saffronDeep:'#8b5200',
  emerald:    '#1a7a40',
  crimson:    '#a82b1c',
  azure:      '#1a5c99',
  plum:       '#6e3a8a',
  bone:       '#1a1a1a',
  muted:      '#555f6e',
  grid:       'rgba(80,80,80,0.12)',
  ink:        '#1c1c1c',
  ink2:       '#ffffff',
  tooltipTitle:'#f5f0e8',
  tooltipBody: '#d8d0c0',
};

const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

export const useThemeColors = () => {
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return dark ? DARK : LIGHT;
};
