/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101C2C",
        paper: "#EEF1F6",
        card: "#FFFFFF",
        amber: {
          brand: "#F2A93B",
        },
        teal: {
          brand: "#1B7F76",
        },
        line: "#D9DEE7",
        muted: "#5C6779",
      },
    },
  },
  plugins: [],
}
