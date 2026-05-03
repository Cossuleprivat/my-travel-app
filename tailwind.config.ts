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
          base: '#0a1520',
          surface: '#192c45',
          elevated: '#1f3a5c',
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
          subtle: '#1e3550',
          interactive: '#2a5070',
        },
      },
      boxShadow: {
        'glow-blue':   '0 0 16px 0 rgba(64,160,208,0.35)',
        'glow-amber':  '0 0 16px 0 rgba(212,128,48,0.35)',
        'glow-green':  '0 0 16px 0 rgba(64,192,112,0.35)',
        'glow-purple': '0 0 16px 0 rgba(160,96,224,0.35)',
        'glow-sm-blue': '0 0 8px 0 rgba(64,160,208,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'pixel-grid': "radial-gradient(circle, rgba(64,160,208,0.07) 1px, transparent 1px)",
      },
      backgroundSize: {
        'pixel-grid': '24px 24px',
      },
      animation: {
        'fade-up':    'fadeUp 0.3s ease-out both',
        'fade-in':    'fadeIn 0.25s ease-out both',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
