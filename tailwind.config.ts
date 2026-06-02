import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#fafafa",
          low: "#f5f5f5",
          high: "#ebebeb",
        },
        "on-surface": {
          DEFAULT: "#171717",
          variant: "#737373",
        },
        accent: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
        },
        border: "#e5e5e5",
        chapter: "#475569",
        knowledge: "#0369a1",
        "exam-point": "#a16207",
        "exam-question": "#b91c1c",
      },
      fontFamily: {
        sans: ["Inter", "PingFang SC", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: "0.6875rem",
        sm: "0.8125rem",
        base: "clamp(0.875rem, 0.85rem + 0.2vw, 1rem)",
        lg: "clamp(1.125rem, 1rem + 0.3vw, 1.25rem)",
        xl: "clamp(1.5rem, 1.3rem + 0.8vw, 2rem)",
      },
      borderRadius: {
        sm: "8px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        ambient: "0 1px 3px rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.03)",
        elevated: "0 2px 6px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      spacing: {
        topbar: "48px",
      },
    },
  },
  plugins: [],
}
export default config
