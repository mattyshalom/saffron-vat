/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0d1117', 2: '#141b24', 3: '#1c2530' },
        line: { DEFAULT: '#2a3340', soft: '#1f2731' },
        bone: { DEFAULT: '#f4ede1', 2: '#e8dfcd' },
        muted: { DEFAULT: '#8a93a3', 2: '#5e6776' },
        saffron: { DEFAULT: '#e8b84e', deep: '#c9962a' },
        sage: '#5fa074',
        brick: '#c45c4a',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        saffron: '0 4px 20px rgba(232, 184, 78, 0.18)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
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
