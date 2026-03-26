/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F5E6C8',
          dark: '#E8D4A8',
          light: '#FAF0DC',
        },
        brown: {
          DEFAULT: '#5C3A1E',
          light: '#7A4E2D',
          dark: '#3D2510',
        },
        forest: {
          DEFAULT: '#2D5A27',
          light: '#3D7A35',
          dark: '#1E3D1A',
        },
        ocean: {
          DEFAULT: '#1A4B6E',
          light: '#2460A0',
          dark: '#0F2E45',
        },
        gold: {
          DEFAULT: '#D4A32E',
          light: '#E8BC4A',
          dark: '#A67C1F',
        },
        crimson: {
          DEFAULT: '#8B1A1A',
          light: '#B02222',
          dark: '#5C1010',
        },
      },
      fontFamily: {
        heading: ['"Pirata One"', 'serif'],
        body: ['Georgia', 'serif'],
        code: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        scroll: '0 4px 20px rgba(92,58,30,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
        'node-glow': '0 0 20px rgba(212,163,46,0.7), 0 0 40px rgba(212,163,46,0.3)',
        'node-available': '0 0 15px rgba(212,163,46,0.8)',
        'node-mastered': '0 0 25px rgba(212,163,46,0.9), 0 0 50px rgba(212,163,46,0.5)',
        parchment: 'inset 0 0 150px rgba(92,58,30,0.4)',
        carved: 'inset 0 2px 4px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.15)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        unfurl: 'unfurl 0.4s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%,100%': { boxShadow: '0 0 15px rgba(212,163,46,0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(212,163,46,0.9), 0 0 50px rgba(212,163,46,0.4)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        unfurl: {
          from: { transform: 'scaleY(0)', opacity: '0', transformOrigin: 'top' },
          to: { transform: 'scaleY(1)', opacity: '1', transformOrigin: 'top' },
        },
        shimmer: {
          '0%,100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'parchment-grain':
          'radial-gradient(ellipse at 20% 30%, rgba(139,90,43,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(100,60,20,0.06) 0%, transparent 40%)',
        vignette:
          'radial-gradient(ellipse at center, transparent 50%, rgba(92,58,30,0.5) 100%)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
