import type { Config } from "tailwindcss";

// Palette + type sampled from the Intelligent Embodiment Design System
// (indigo #3A366F mandala + copper #C0896D wordmark, warm cream paper).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: "#F0EFF6",
          100: "#E0DEEC",
          300: "#9B98BE",
          500: "#5E5A99",
          600: "#4A4684",
          700: "#3A366F",
          800: "#2A2752",
          900: "#201E3E",
        },
        copper: {
          50: "#FAF1EA",
          100: "#F2E3D8",
          300: "#E0BEA9",
          500: "#CF9E84",
          700: "#C0896D",
          800: "#A66B4E",
          900: "#7E4E36",
        },
        paper: { DEFAULT: "#F8F3EB", 2: "#FCF9F3" },
        sand: "#EFE7D9",
        clay: "#E4D8C7",
        stone: "#CFC3B2",
        ink: {
          400: "#857F97",
          500: "#5B5772",
          700: "#3C3952",
          900: "#211F33",
        },
        sage: { DEFAULT: "#6E8B6A", bg: "#E9EFE6" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1200px",
        prose: "68ch",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(33,31,51,0.05)",
        sm: "0 2px 8px rgba(33,31,51,0.06)",
        md: "0 8px 24px rgba(33,31,51,0.08)",
        lg: "0 18px 48px rgba(33,31,51,0.10)",
      },
      borderRadius: {
        lg: "14px",
        xl: "22px",
      },
      keyframes: {
        "ie-fade": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "ie-fade": "ie-fade 240ms ease",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
