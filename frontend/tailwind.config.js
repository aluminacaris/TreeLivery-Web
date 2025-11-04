/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        esc: "#091108",
        marro: "#4C361A",
        verdeclaro: "#B6D38D",
        marelo: "#F6CA83",
        cinza: "#9CAFB7",
        fundo: "#FDFFF9",
      },
    },
  },
  plugins: [],
}
