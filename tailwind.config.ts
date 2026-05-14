import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "#eceef9",
        "app-50": "#f5f6fc",
        "app-100": "#eceef9",
        "app-200": "#dde0f5",
        slate: {
          750: "#2a3047",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Yu Gothic",
          "Meiryo",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 16px -4px rgba(67,97,238,0.12), 0 0 0 1px rgba(67,97,238,0.06)",
        "card-must": "0 8px 32px -8px rgba(67,97,238,0.40)",
        sidebar: "4px 0 24px -8px rgba(67,97,238,0.12)",
        glass: "0 8px 32px rgba(67,97,238,0.08)",
      },
      keyframes: {
        "wave-fill": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "wave-fill": "wave-fill 4s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
