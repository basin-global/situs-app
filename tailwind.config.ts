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
      },
      fontSize: {
        'base': '1.125rem',    // Increase base font size
        'lg': '1.25rem',       // Adjust larger sizes accordingly
        'xl': '1.375rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      colors: {
        // Dark mode colors
        background: "#1a1a1a",
        foreground: "#ffffff",
        border: "#333333",
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#4b5563",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#374151",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "#60a5fa",
          foreground: "#ffffff",
        },
        // You can add more color definitions as needed
      },
    },
  },
  plugins: [],
}

export default config
