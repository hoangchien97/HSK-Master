const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    // ... các đường dẫn khác
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [heroui()],
}
