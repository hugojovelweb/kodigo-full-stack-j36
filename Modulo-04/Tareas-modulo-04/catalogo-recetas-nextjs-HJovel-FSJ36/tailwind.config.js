/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#15140F",
        surface: "#1E1C16",
        surface2: "#262319",
        line: "#35311F",
        ink: "#F3EFE4",
        muted: "#A79F8C",
        sage: {
          DEFAULT: "#7C8C5E",
          light: "#9CAB7D",
        },
        rust: {
          DEFAULT: "#C1652E",
          light: "#D68752",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-work-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wide2: "0.06em",
      },
    },
  },
  plugins: [],
};
