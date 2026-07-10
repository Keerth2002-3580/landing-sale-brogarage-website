/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          550: '#16a34a',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        gray: {
          150: '#f3f4f6', // Slightly lighter border gray
          250: '#e5e7eb',
          350: '#cbd5e1',
          450: '#94a3b8',
          550: '#4b5563',
          650: '#374151',
          750: '#1f2937',
          805: '#1e293b', // Modern dark slate
          850: '#0f172a', // Rich deep slate
          855: '#0f172a',
          55: '#f8fafc',  // Ultra-light slate for backgrounds
          555: '#475569',
          405: '#64748b',
          808: '#1e293b',
        },
        red: {
          150: '#fecaca',
          550: '#dc2626',
          650: '#b91c1c',
          750: '#991b1b',
          655: '#b91c1c',
        },
        green: {
          150: '#bbf7d0',
          455: '#22c55e',
          650: '#15803d',
          755: '#166534',
        },
        emerald: {
          150: '#a7f3d0',
        },
        amber: {
          150: '#fde68a',
          805: '#92400e',
        }
      },
    },
  },
  plugins: [],
}
