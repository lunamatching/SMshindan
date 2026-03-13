import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        luna: {
          bg: '#0d0117',
          card: '#140528',
          gold: '#c9a84c',
          rose: '#e8a5b4',
          text: '#f5f0ff',
          muted: '#b8a9d0',
          border: '#2a1245',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      backgroundImage: {
        'luna-gradient': 'linear-gradient(135deg, #0d0117 0%, #1a0533 100%)',
        'gold-gradient': 'linear-gradient(135deg, #c9a84c 0%, #f5d98b 50%, #c9a84c 100%)',
        'type-l': 'linear-gradient(135deg, #1a0533 0%, #2d0f5c 100%)',
        'type-f': 'linear-gradient(135deg, #1a0f1f 0%, #3d1535 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}

export default config
