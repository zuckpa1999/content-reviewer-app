/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#e50914',
          hover:   '#f40612',
          muted:   '#b20710',
        },
        dark: {
          50:  '#f0f0f0',
          100: '#d4d4d4',
          200: '#a3a3a3',
          300: '#737373',
          400: '#525252',
          500: '#404040',
          600: '#262626',
          700: '#1a1a1a',
          800: '#141414',
          900: '#0a0a0a',
          950: '#050505',
        }
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                           '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
