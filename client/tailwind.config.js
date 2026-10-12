/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        iem: {
          navy: '#0b2545',
          dark: '#13315c',
          blue: '#134074',
          accent: '#0077b6',
          sky: '#8da9c4',
          light: '#eef4f8',
          gold: '#c59b27',
          goldlight: '#fdf6e2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
