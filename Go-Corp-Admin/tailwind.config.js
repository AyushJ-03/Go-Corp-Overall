/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#121826', // dark premium theme
        brandBlue: '#3b82f6',
        dash: {
          bg: '#f8f9fa',
          card: '#ffffff',
          border: '#eef1f4',
          text: '#1a1a1a',
          muted: '#6b7280',
          blue: '#3b82f6',
          red: '#ef4444',
          green: '#10b981',
          yellow: '#f59e0b',
        }
      }

    },
  },
  plugins: [],
}
