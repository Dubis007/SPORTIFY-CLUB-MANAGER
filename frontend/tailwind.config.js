/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sportify: {
          primary: '#2563eb',   // Azul institucional profundo (Enterprise ERP)
          secondary: '#1e3a8a', // Azul marino corporativo
          dark: '#f8fafc',      // Texto principal claro sobre fondos slate-950/900
          light: '#020617',     // Fondo base slate-950
          gray: '#1e293b',      // Bordes sutiles slate-800
        }
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
