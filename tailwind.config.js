/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // All custom colors use CSS RGB channel vars so opacity modifiers (bg-saffron/10)
        // and hover states work correctly in both dark and light theme.
        ink: {
          DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
          2: 'rgb(var(--ink-2-rgb) / <alpha-value>)',
          3: 'rgb(var(--ink-3-rgb) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--line-rgb) / <alpha-value>)',
          soft: 'rgb(var(--line-soft-rgb) / <alpha-value>)',
        },
        bone: {
          DEFAULT: 'rgb(var(--bone-rgb) / <alpha-value>)',
          2: 'rgb(var(--bone-2-rgb) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted-rgb) / <alpha-value>)',
          2: 'rgb(var(--muted-2-rgb) / <alpha-value>)',
        },
        saffron: {
          DEFAULT: 'rgb(var(--saffron-rgb) / <alpha-value>)',
          deep: 'rgb(var(--saffron-deep-rgb) / <alpha-value>)',
        },
        sage:  'rgb(var(--sage-rgb) / <alpha-value>)',
        brick: 'rgb(var(--brick-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans:    ['Manrope', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        saffron: '0 4px 20px rgb(var(--saffron-rgb) / 0.18)',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
