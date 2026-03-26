import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: {
          bg: "var(--sidebar-bg)",
          active: "var(--sidebar-active)",
        },
        "primary-navy": "var(--text-primary)",
        accent: {
          yellow: "var(--accent-yellow)",
        }
      },
      fontFamily: {
        prompt: ["var(--font-prompt)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
