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
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(400%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        scan: 'scan 3s ease-in-out infinite',
        shimmer: 'shimmer 3s infinite'
      }
    },
  },
  plugins: [],
};
export default config;
