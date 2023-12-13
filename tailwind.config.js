module.exports = {
  mode: "jit",
  content: [
    "./src/**/**/*.{js,ts,jsx,tsx,html,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,html,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: { md: { max: "1050px" }, sm: { max: "550px" } },
    extend: {
      colors: {
        deep_orange: { 50: "#f5eaea", "50_01": "#f5e9e9" },
        gray: { 400: "#c8c3c3", 800: "#6b240c" },
        amber: { 500: "#f2c113" },
        blue_gray: { 500: "#6d7391", 900: "#26263f" },
        indigo: { 200: "#a1afcc", A200: "#605dec" },
        orange: { 100: "#f5cca0" },
        black: { 900: "#000000" },
        deep_purple: { A200: "#9747ff" },
        white: { A700: "#ffffff" },
      },
      fontFamily: {
        nanummyeongjo: "NanumMyeongjo",
        montserrat: "Montserrat",
        nunitosans: "Nunito Sans",
      },
      backgroundImage: { gradient: "linear-gradient(180deg ,#f2c113,#f2c113)" },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
