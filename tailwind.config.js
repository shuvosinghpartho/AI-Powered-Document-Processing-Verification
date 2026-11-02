/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cottage: {
          navy: '#1c3461',
          blue: '#2f5fb0',
          blueLight: '#eef4ff',
          orange: '#e57824',
          orangeHover: '#d06a16',
          orangeLight: '#fff4d6',
          darkBg: '#090d16',
          darkCard: '#101726',
          darkBorder: '#1e293b'
        },
        brand: {
          50: '#f0f5ff',
          100: '#e5edff',
          200: '#cce0ff',
          300: '#99c2ff',
          400: '#5c9aff',
          500: '#2f5fb0',
          600: '#1c3461',
          700: '#16294d',
          800: '#111f3b',
          900: '#0c162a',
          950: '#070c17',
        },
        slate: {
          850: '#151f32',
          925: '#0b1120',
          950: '#080c14',
        }
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};

