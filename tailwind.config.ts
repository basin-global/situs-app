import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)', ...fontFamily.sans],
        mono: ['var(--font-space-mono)', ...fontFamily.mono],
        display: ['var(--font-space-mono)', ...fontFamily.mono], // Changed this line
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      colors: {
        background: {
          DEFAULT: "#ffffff",
          dark: "#1a1a1a",
        },
        foreground: {
          DEFAULT: "#000000",
          dark: "#ffffff",
        },
        border: {
          DEFAULT: "#e5e7eb",
          dark: "#333333",
        },
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
          dark: "#2563eb",
          "dark-foreground": "#ffffff",
        },
        secondary: {
          DEFAULT: "#4b5563",
          foreground: "#ffffff",
          dark: "#6b7280",
          "dark-foreground": "#ffffff",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
          dark: "#374151",
          "dark-foreground": "#9ca3af",
        },
        accent: {
          DEFAULT: "#60a5fa",
          foreground: "#ffffff",
          dark: "#3b82f6",
          "dark-foreground": "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        error: {
          DEFAULT: "#ef4444",
          dark: "#dc2626",
        },
      },
      letterSpacing: {
        'mono-display': '0.1em', // Adjust this value as needed
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode
}

export default config
