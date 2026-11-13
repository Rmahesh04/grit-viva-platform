/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grit: {
          noir: '#02040A',
          bg: '#030611',
          panel: '#070C1B',
          surface: '#0C1224',
          elevated: '#111A33',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          indigo: '#6366F1',
          emerald: '#10B981',
          gold: '#F59E0B',
          rose: '#F43F5E',
          cyan: '#06B6D4'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      boxShadow: {
        'glow-indigo': '0 0 50px -10px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 50px -10px rgba(16, 185, 129, 0.35)',
        'glow-gold': '0 0 50px -10px rgba(245, 158, 11, 0.35)',
        'glow-rose': '0 0 50px -10px rgba(244, 63, 94, 0.35)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
      }
    },
  },
  plugins: [],
}
