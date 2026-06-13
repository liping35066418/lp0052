/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5F0',
          100: '#FFE6D9',
          200: '#FFC9B0',
          300: '#FFA67A',
          400: '#FF8B52',
          500: '#FF6B35',
          600: '#E55520',
          700: '#BC4018',
          800: '#963215',
          900: '#7A2B15',
        },
        secondary: {
          50: '#F0F5F2',
          100: '#D6E5DD',
          200: '#A8C7B7',
          300: '#78A890',
          400: '#4D8A6E',
          500: '#1A3A2A',
          600: '#152F22',
          700: '#10241A',
          800: '#0B1811',
          900: '#060C09',
        },
        accent: {
          gold: '#D4AF37',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
