/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rarity-common': '#9CA3AF',
        'rarity-bronze': '#CD7F32',
        'rarity-silver': '#C0C0C0',
        'rarity-gold': '#FFD700',
      }
    },
  },
  plugins: [],
}
