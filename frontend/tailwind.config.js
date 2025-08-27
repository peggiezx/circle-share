// tailwind.config.js
export default {
  content: [
    [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
  ],
  mode: 'jit',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Lusitana", "Georgia", "serif"],
      },
      spacing: {
        '1/2': '50%',
        '1/3': '33.333%',
        '2/3': '66.6667%',
        '1/4': '25%'
      }
    },
  },
};
