/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#CCF83B',
        'primary-hover': '#B8E635',
        background: {
          light: '#ffffff',
          dark: '#121212',
        },
        surface: {
          light: '#F7F7F0',
          dark: '#1E1E1E',
        },
        card: {
          light: '#ffffff',
          dark: '#1E1E1E',
        }
      },
      borderRadius: {
        '2xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}