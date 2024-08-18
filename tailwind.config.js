/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      color: {
        'dark-bg': '#141414'
      }
    },
  },
  plugins: [],
}

