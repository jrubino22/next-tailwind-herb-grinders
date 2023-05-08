/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js, ts, jsx, tsx}",
    "./components/**/*.{js, ts, jsx, tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Alpha_Slab_One', 'serif'],
        'subheading': ['Poppins', 'Helvetica', 'Arial', 'sans-serif'],
        'body': ['Noto_Serif', 'Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}