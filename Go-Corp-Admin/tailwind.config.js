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
        background: '#0c121c',
        brandBlue: '#4f46e5',
        'health-navy': '#0c121c',
        'health-blue': '#4f46e5',
        'health-cream': '#f9f7ff',
        'health-lavender': '#efeaff',
        dash: {
          bg: '#f8f9fa',
          card: '#ffffff',
          border: '#eef1f4',
          text: '#1a1a1a',
          muted: '#6b7280',
          blue: '#4f46e5',
          red: '#ef4444',
          green: '#10b981',
          yellow: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
