/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0a0f1f',
        ember: '#f1b34c',
        neon: '#5ad0ff'
      },
      boxShadow: {
        glow: '0 0 24px rgba(90, 208, 255, 0.2)'
      }
    }
  },
  plugins: []
};
