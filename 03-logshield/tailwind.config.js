/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e1a',
        surface: '#111827',
        'surface-2': '#1a2235',
        border: '#1f2937',
        accent: '#38bdf8',
        'text-primary': '#f1f5f9',
        'text-muted': '#64748b',
        critical: '#ef4444',
        high: '#f97316',
        medium: '#eab308',
        low: '#22c55e',
        info: '#64748b',
      },
    },
  },
  plugins: [],
};
