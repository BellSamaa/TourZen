// tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                  // đọc file HTML gốc
    "./*.{html,js,jsx,ts,tsx}",      // đọc mọi file ở thư mục gốc
    "./src/**/*.{html,js,jsx,ts,tsx}", // đọc tất cả file trong thư mục src
    "./public/**/*.{html,js}",        // (tuỳ chọn) đọc thêm các file trong public
  ],
  darkMode: 'class', // Bật dark mode
  theme: {
    extend: {
      colors: {
        'primary': {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6', // Màu chính
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
        },
        'secondary': {
          DEFAULT: '#f97316', // Cam
          'light': '#fb923c',
        },
        'neutral': {
          '50': '#f8f9fa',
          '100': '#e9ecef',
          '200': '#dee2e6',
          '300': '#ced4da',
          '400': '#adb5bd',
          '500': '#6c757d',
          '600': '#495057',
          '700': '#343a40',
          '800': '#212529',
          '900': '#121212',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)',
        'lifted': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}