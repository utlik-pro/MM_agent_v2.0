/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'voice-primary': '#000000',
        'voice-secondary': '#10B981',
        'voice-danger': '#EF4444',
        'voice-gray': '#6B7280',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      boxShadow: {
        'voice': '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
        'voice-hover': '0 8px 25px -3px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
} 