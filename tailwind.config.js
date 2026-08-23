/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050510',
          900: '#0a0a1f',
          800: '#0f1230',
          700: '#161a3a',
          600: '#1e234a',
        },
        saffron: {
          400: '#ffb05c',
          500: '#ff9933',
          600: '#e67e00',
        },
        indiagreen: {
          400: '#6ee7a0',
          500: '#4ade80',
          600: '#22c55e',
        },
        electric: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        gold: {
          400: '#fcd34d',
          500: '#fbbf24',
          600: '#f59e0b',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
        'hindi-serif': ['"Tiro Devanagari Hindi"', 'serif'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
    },
  },
  plugins: [],
};
