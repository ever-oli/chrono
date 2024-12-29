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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        'base': '8px',
        'component': '16px',
        'content': '24px',
        'section': '32px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;