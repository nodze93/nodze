import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zelena: {
          DEFAULT: "#1D9E75",
          tamna: "#0F6E56",
          svijetla: "#E1F5EE",
        },
        tekst: {
          DEFAULT: "#1a1a1a",
          muted: "#6b6b6b",
          light: "#999999",
        },
        border: "#e8e8e8",
        bg: "#f7f7f5",
        plava: {
          bg: "#E6F1FB",
          tekst: "#0C447C",
        },
        narandzasta: {
          bg: "#FAEEDA",
          tekst: "#633806",
        },
        crvena: {
          bg: "#FAECE7",
          tekst: "#712B13",
        },
        ljubicasta: {
          bg: "#EEEDFE",
          tekst: "#3C3489",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
