/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mocha: {
          DEFAULT: '#947764',
          light: '#a68d7d',
          dark: '#816758'
        }
      }
    },
  },
  plugins: [],
};