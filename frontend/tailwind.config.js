/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primario: "#2E7D32",     // verde escuro principal
        secundario: "#A5D6A7",   // verde claro (fundo/acentos)
        destaque: "#FDD835",     // amarelo destaque
        claro: "#FFFDE7",        // bege bem claro
        texto: "#3E2723",        // marrom escuro (para legibilidade)
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
