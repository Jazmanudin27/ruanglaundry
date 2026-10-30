/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0f172a',
          navyLight: '#1e293b',
          blue: '#0284c7',
          blueHover: '#0369a1',
          blueLight: '#e0f2fe',
          cyan: '#0ea5e9',
        }
      }
    },
  },
  plugins: [],
}
