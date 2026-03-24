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
        "gpt-sidebar": "#171717",
        "gpt-bg": "#212121",
        "gpt-surface": "#2f2f2f",
        "gpt-surface-hover": "#3a3a3a",
        "gpt-border": "rgba(255,255,255,0.1)",
        "gpt-green": "#10a37f",
      },
      maxWidth: {
        "chat": "48rem",
      },
      height: {
        header: "52px",
      },
    },
  },
  plugins: [],
};

export default config;
