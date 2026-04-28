import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E2044",
        ink2: "#1B3461",
        olive: "#6E7E28",
        olive2: "#8FA832",
        orange: "#C85C1E",
        rubine: "#CE0058",
        off: "#F4F6FA",
        light: "#E8ECF2",
        mid: "#8A95A8",
        dark: "#1A2235",
      },
      fontFamily: {
        brand: ["var(--font-josefin)", "Century Gothic Pro", "Century Gothic", "Futura", "sans-serif"],
        body: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#1A2235",
            maxWidth: "none",
            h1: { color: "#0E2044", fontFamily: "var(--font-josefin), Century Gothic, sans-serif" },
            h2: { color: "#0E2044", fontFamily: "var(--font-josefin), Century Gothic, sans-serif", marginTop: "1.25em" },
            h3: { color: "#1B3461", fontFamily: "var(--font-josefin), Century Gothic, sans-serif" },
            strong: { color: "#0E2044" },
            blockquote: { borderLeftColor: "#C85C1E", color: "#1A2235", backgroundColor: "#FFF8F5", padding: "0.5rem 1rem", borderRadius: "0.25rem" },
            "blockquote p": { margin: 0 },
            table: { fontSize: "0.8rem" },
            "thead th": { color: "#0E2044", backgroundColor: "#F4F6FA" },
            a: { color: "#6E7E28" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
