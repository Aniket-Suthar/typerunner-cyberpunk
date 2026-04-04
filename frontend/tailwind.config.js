/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a0f',
          darker: '#06060a',
          panel: '#12121a',
          border: '#1a1a2e',
          primary: '#00f0ff',
          secondary: '#ff00e5',
          accent: '#f0ff00',
          success: '#00ff88',
          danger: '#ff0040',
          warning: '#ff8800',
          text: '#e0e0ff',
          muted: '#6a6a8a',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00f0ff, 0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)',
        'neon-pink': '0 0 5px #ff00e5, 0 0 20px rgba(255, 0, 229, 0.3), 0 0 40px rgba(255, 0, 229, 0.1)',
        'neon-green': '0 0 5px #00ff88, 0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
        'neon-red': '0 0 5px #ff0040, 0 0 20px rgba(255, 0, 64, 0.3), 0 0 40px rgba(255, 0, 64, 0.1)',
        'neon-yellow': '0 0 5px #f0ff00, 0 0 20px rgba(240, 255, 0, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'glitch': 'glitch 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(-2px, 2px)' },
          '94%': { transform: 'translate(2px, -2px)' },
          '96%': { transform: 'translate(-1px, -1px)' },
          '98%': { transform: 'translate(1px, 1px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
