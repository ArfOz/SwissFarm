/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2e7d32',
        'primary-dark': '#1b5e20',
        'primary-light': '#388e3c',
        secondary: '#e53935',
        surface: '#f5f5f5',
        'text-primary': '#222',
        'text-secondary': '#666',
        border: '#eee',
        info: '#1976d2',
      },
    },
  },
  plugins: [],
};