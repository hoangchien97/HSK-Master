const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./constants/**/*.{js,ts,jsx,tsx}",
    "./enums/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-noto-serif)', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        'hsk-1': '#16a34a',
        'hsk-2': '#0891b2',
        'hsk-3': '#2563eb',
        'hsk-4': '#7c3aed',
        'hsk-5': '#d97706',
        'hsk-6': '#e31b1e',
      },
    },
  },
  plugins: [heroui()],
}
