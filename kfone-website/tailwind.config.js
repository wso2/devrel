/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  daisyui: {
    themes: ['light']
  },
  theme: {
    extend: {
      fontFamily: {
        title: ['Comfortaa'],
        display: ['Noto Sans', 'system-ui', 'sans-serif'],
        body: ['Noto Sans', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: '#E60000',
          50: '#FF9F9F',
          100: '#FF8A8A',
          200: '#FF6161',
          300: '#FF3939',
          400: '#FF1010',
          500: '#E60000',
          600: '#AE0000',
          700: '#760000',
          800: '#3E0000',
          900: '#060000'
        },
        secondary: {
          DEFAULT: '#212738',
          50: '#B7BED4',
          100: '#AAB3CD',
          200: '#909CBE',
          300: '#7685AF',
          400: '#5E6F9F',
          500: '#4E5D85',
          600: '#3F4B6B',
          700: '#303952',
          800: '#212738',
          900: '#0C0E15'
        },
        light: '#f2f2f2'
      }
    }
  },
  plugins: [require('daisyui'), require('@tailwindcss/aspect-ratio'), require('@tailwindcss/forms')]
};
