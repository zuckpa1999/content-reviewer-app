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

        /* Splash intro — film gate */
        'film-run':       'filmRun 1600ms cubic-bezier(0.08, 0.75, 0.2, 1) both',
        'light-leak':     'lightLeak 1300ms ease-in-out 150ms both',
        'frame-settle':   'frameSettle 620ms cubic-bezier(0.16, 1, 0.3, 1) 760ms both',
        'gate-up':        'gateUp 500ms cubic-bezier(0.7, 0, 0.84, 0) forwards',
        'gate-down':      'gateDown 500ms cubic-bezier(0.7, 0, 0.84, 0) forwards',
        'gate-collapse':  'gateCollapse 500ms ease-in forwards',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                           '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },

        /* Splash intro — film gate */
        filmRun:     { '0%': { transform: 'translateX(0)' },   '100%': { transform: 'translateX(-50%)' } },
        lightLeak:   { '0%': { transform: 'translateX(0)', opacity: '0' }, '25%': { opacity: '1' }, '100%': { transform: 'translateX(520%)', opacity: '0' } },
        frameSettle: {
          '0%':   { opacity: '0', transform: 'translateX(48px) scale(0.94)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        gateUp:       { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-102%)' } },
        gateDown:     { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(102%)' } },
        gateCollapse: { '0%': { opacity: '1', transform: 'scaleY(1)' }, '100%': { opacity: '0', transform: 'scaleY(0.4)' } },
      },
    },
  },
  plugins: [],
}
