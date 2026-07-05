/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{tsx,html}"],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        background: "#0A1628", // fallback
        cyan: "#00F5FF",
        purple: "#6B5B95",
        gold: "#FFD700",
      },
    },
  },
  plugins: [],
}
