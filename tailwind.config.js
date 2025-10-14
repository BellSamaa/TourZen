// tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme';
import formsPlugin from '@tailwindcss/forms'; // Dùng import thay vì require cho nhất quán

/** @type {import('tailwindcss').Config} */
export default {
  // ✅ Content: Đảm bảo Tailwind quét đúng file để tìm các class bạn đã dùng
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Hầu hết code sẽ nằm trong src
  ],

  darkMode: 'class', // Bật/tắt dark mode bằng cách thêm/xóa class 'dark' ở thẻ <html>

  theme: {
    // ✅ Extend: Mở rộng theme mặc định thay vì ghi đè hoàn toàn
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
          // ... (bảng màu neutral của bạn đã rất tốt)
        },
      },
      fontFamily: {
        // ✅ Thêm font Inter vào trước danh sách font mặc định
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)',
        'lifted': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      // ✅ Thêm animation tùy chỉnh
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

  // ✅ Plugins: Mở rộng chức năng cho Tailwind
  plugins: [
    formsPlugin, // Thêm plugin @tailwindcss/forms
  ],
}