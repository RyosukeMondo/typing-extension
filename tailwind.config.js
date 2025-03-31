/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './options.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      textShadow: {
        DEFAULT: '1px 1px 1px rgba(0, 0, 0, 0.5)',
      },
      boxShadow: {
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      colors: {
        'button-blue': {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        'button-red': {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        'button-green': {
          DEFAULT: '#10b981',
          hover: '#059669',
        }
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}
