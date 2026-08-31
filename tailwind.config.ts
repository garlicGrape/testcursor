import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0714",
          900: "#130b22",
          800: "#1c1233",
          700: "#2a1b4a",
        },
        violet: {
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#6d28d9",
          700: "#4c1d95",
        },
        gold: {
          200: "#f3e0a8",
          400: "#e2b857",
          500: "#cba135",
        },
        paper: "#f3ede0",
        ember: "#ff6b3d",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        dojo: "0 0 0 1px rgba(226, 184, 87, 0.12), 0 24px 80px -24px rgba(87, 6, 140, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
