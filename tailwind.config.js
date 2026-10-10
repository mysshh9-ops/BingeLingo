/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          900: '#1a1820',
          850: '#221f2b',
          800: '#2a2733',
          700: '#35303f',
          600: '#443e52',
          500: '#544c63',
        },
        cream: {
          DEFAULT: '#f5efe6',
          dim: '#d6cfc4',
          muted: '#a09a90',
        },
        lavender: {
          DEFAULT: '#b8a4d4',
          bright: '#c9b3e8',
          dim: '#9a85b5',
        },
        rose: {
          DEFAULT: '#e0999e',
          bright: '#ecafb4',
          dim: '#c77e83',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'system-ui', 'sans-serif'],
        korean: ['Noto Sans KR', 'sans-serif'],
        koreanSerif: ['Noto Serif KR', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
