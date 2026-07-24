/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        paper: "#fafaf9",
        ink: {
          900: "#0a2540",
          800: "#0c3070",
          700: "#1a4d7a",
          600: "#2a7ab0",
          500: "#5fa8d3",
          400: "#85B7EB",
          300: "#B5D4F4",
          200: "#E6F1FB",
          100: "#F0F8FF",
        },
        amber: {
          600: "#854F0B",
          500: "#BA7517",
          400: "#EF9F27",
          300: "#FAC775",
          200: "#FAEEDA",
        },
        stone: {
          900: "#2C2C2A",
          800: "#444441",
          700: "#5F5E5A",
          600: "#888780",
          500: "#B4B2A9",
          400: "#D3D1C7",
          300: "#F1EFE8",
        },
      },
    },
  },
  plugins: [],
};
