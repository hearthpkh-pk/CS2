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
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100vw)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100vw)', opacity: '0' },
        }
      },
      animation: {
        scan: 'scan 3s ease-in-out infinite',
        shimmer: 'shimmer 3s infinite',
        'slide-in-right': 'slide-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-out-left': 'slide-out-left 0.4s cubic-bezier(0.7, 0, 0.84, 0) both',
      }
    },
  },
  plugins: [],
};
export default config;
