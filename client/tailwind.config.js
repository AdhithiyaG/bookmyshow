/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          500: '#1f4fff',
          600: '#173fe6'
        }
      }
    }
  },
  plugins: []
}
