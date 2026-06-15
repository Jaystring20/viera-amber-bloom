import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Base colors
        "brand-dark": "#0A0A0A",
        "brand-darker": "#050505",
        "brand-dark-secondary": "#0F172A",
        "brand-text": "#FAFAFA",
        "brand-textDim": "#888888",
        "brand-borderSubtle": "#2A2A2A",

        // Ecosystem arm colors
        "ecosystem-illustrations": "#D97706",  // Gold/Orange
        "ecosystem-vagin": "#62017F",          // Purple
        "ecosystem-vagin-accent": "#ED155D",   // Hot Pink (PAD KOLO)
        "ecosystem-viva": "#6E0025",           // Deep Burgundy
        "ecosystem-vam": "#888888",            // Gray (can be customized)
        "ecosystem-vash": "#0B7B8C",           // Teal

        // Legacy (keep for backwards compatibility)
        "brand-gold": "#C8A96E",

        // Semantic colors
        "success": "#10B981",
        "warning": "#F59E0B",
        "error": "#EF4444",
        "info": "#3B82F6",

        // Glass effect colors (semi-transparent)
        "glass-dark": "rgba(26, 26, 26, 0.6)",
        "glass-border": "rgba(217, 119, 6, 0.15)",
        "glass-border-hover": "rgba(217, 119, 6, 0.4)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
      },
      zIndex: {
        hide: "-1",
        auto: "auto",
        base: "0",
        dropdown: "10",
        sticky: "20",
        fixed: "30",
        modal: "100",
        popover: "110",
        tooltip: "1000",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
