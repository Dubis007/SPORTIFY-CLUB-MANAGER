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
          primary: '#dc2626',   // Rojo vibrante
          secondary: '#facc15', // Amarillo vibrante
          dark: '#000000',      // Negro
          light: '#f8f9fa',     // Gris claro / Blanco (estilo Bootstrap)
          gray: '#e9ecef',      // Gris para bordes
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
