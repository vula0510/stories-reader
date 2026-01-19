import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-app': '#0b1121',
        'bg-surface': '#151e32',
        'bg-glass': 'rgba(11, 17, 33, 0.92)',
        'bg-input': '#1c263d',
        'text-main': '#eceff4',
        'text-sub': '#94a3b8',
        'accent': '#ff4757',
        'accent-dark': '#d63031',
        'warning': '#f1c40f',
      },
      fontFamily: {
        'serif': ['Merriweather', 'serif'],
        'sans': ['Quicksand', 'sans-serif'],
        'handwriting': ['Patrick Hand', 'cursive'],
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          'from': { transform: 'scale(0.8) translateY(10px)', opacity: '0' },
          'to': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        popIn: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
} satisfies Config
