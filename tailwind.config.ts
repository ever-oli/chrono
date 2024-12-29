import { type Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Inter", "SF Pro Display", "system-ui"],
        body: ["Inter", "SF Pro Text", "system-ui"],
        mono: ["SF Mono", "monospace"],
      },
      fontSize: {
        "header-lg": ["1.5rem", "2rem"],     // 24px
        "header-base": ["1.25rem", "1.75rem"], // 20px
        "body": ["1rem", "1.5rem"],          // 16px
        "sm": ["0.875rem", "1.25rem"],       // 14px
        "time": ["1.125rem", "1.5rem"],      // 18px
      },
      gridTemplateColumns: {
        '53': 'repeat(53, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '7': 'repeat(7, minmax(0, 1fr))',
      },
      colors: {
        // Base Colors
        'space-cadet': '#151E3F',
        'beige': '#F2F3D9',
        'oxford-blue': '#030027',
        'buff': '#DC9E82',
        'old-rose': '#C16E70',
        // Semantic Colors
        'success': '#4CAF50',
        'warning': '#FFA726',
        'error': '#EF5350',
        'info': '#151E3F',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(21, 30, 63, 0.1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;