/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  // Allows toggling between light and dark themes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a202c',
        'dark-text': '#e2e8f0',
      },
    },
  },
  plugins: [],
};
