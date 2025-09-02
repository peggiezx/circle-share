// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Lusitana", "Georgia", "serif"],
      },
      spacing: {
        "1/2": "50%",
        "1/3": "33.333%",
        "2/3": "66.6667%",
        "1/4": "25%",
      },
      colors: {
        brand: {
          DEFAULT: "#B3EBF2",
          50: "#f0fefe",
          100: "#e1fdfd", 
          200: "#c3fafa",
          300: "#B3EBF2",
          400: "#85dde6",
          500: "#57d0d9",
          600: "#29c2cc",
          700: "#1ea2a9",
          800: "#147a7f",
          900: "#0a5255"
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
    },
  },
};
