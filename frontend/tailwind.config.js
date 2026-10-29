/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // Primary Imperial Gold
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          gold: '#d97706',
          champagne: '#fde68a',
          amber: '#f59e0b',
          obsidian: '#050811',
          navy: '#070C18',
          dark: '#0B1222',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
