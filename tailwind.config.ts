import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, grounding copper palette — "Awake in the Body"
        copper: {
          50: "#faf5f0",
          100: "#f3e7db",
          200: "#e6ccb5",
          300: "#d6ab88",
          400: "#c68a5f",
          500: "#b26d3f", // primary copper
          600: "#9a5632",
          700: "#7c422b",
          800: "#673728",
          900: "#582f24",
        },
        sand: {
          50: "#fbf8f4",
          100: "#f5efe6",
          200: "#ece0cf",
        },
        clay: "#3a2e26",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        "spin-slow": "spin-slow 90s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
