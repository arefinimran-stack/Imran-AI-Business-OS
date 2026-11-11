import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#667085",
        canvas: "#f5f6f8",
        brand: "#183b35",
        accent: "#c9a86a"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(16, 24, 40, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
