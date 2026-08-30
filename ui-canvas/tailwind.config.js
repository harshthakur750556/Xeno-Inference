/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xeno: {
          dark: '#030306',
          panel: '#08080f',
          card: 'rgba(12, 12, 22, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          cyan: '#00f5d4',
          violet: '#8b5cf6',
          magenta: '#ff007f',
          gold: '#ffd166',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        roman: ['Cinzel', 'Cinzel Decorative', 'Trajan Pro', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'spin-slow': 'spin 25s linear infinite',
        'spin-reverse-slow': 'spinReverse 35s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-12px) scale(1.01)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 25px rgba(0, 245, 212, 0.35))' },
          '50%': { opacity: '0.95', filter: 'drop-shadow(0 0 50px rgba(139, 92, 246, 0.65)) drop-shadow(0 0 80px rgba(255, 0, 127, 0.4))' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        spinReverse: {
          'from': { transform: 'rotate(360deg)' },
          'to': { transform: 'rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
}
