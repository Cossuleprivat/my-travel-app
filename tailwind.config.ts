import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        bg: {
          base: '#0e1a26',
          surface: '#121e2c',
          elevated: '#162230',
        },
        text: {
          primary: '#e0eef8',
          secondary: '#a8c4d8',
          muted: '#7892a8',
        },
        accent: {
          blue: '#40a0d0',
          amber: '#d48030',
          green: '#40c070',
          purple: '#a060e0',
        },
        border: {
          subtle: '#192535',
          interactive: '#2a5070',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease-out both',
        'fade-in': 'fadeIn 0.25s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
