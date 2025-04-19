// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#f9b9c3', // Soft pink
            light: '#fce4e9',
            dark: '#e5a1ab',
          },
          secondary: {
            DEFAULT: '#f4e2d3', // Beige
            light: '#f9efe6',
            dark: '#e8d6c7',
          },
          accent: {
            DEFAULT: '#ff7f7f', // Coral
            light: '#ff9999',
            dark: '#e57373',
          },
          neutral: {
            50: '#f9f9f9',
            100: '#f3f3f3',
            200: '#e9e9e9',
            300: '#d5d5d5',
            400: '#b3b3b3',
            500: '#808080',
            600: '#666666',
            700: '#4d4d4d',
            800: '#333333',
            900: '#1a1a1a',
          },
        },
        fontFamily: {
          sans: ['Inter var', 'sans-serif'],
          heading: ['Montserrat', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }