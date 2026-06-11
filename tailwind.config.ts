import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0e1a',
          navy: '#0d1b2a',
          blue: '#1a3a5c',
          accent: '#00d4ff',
          neon: '#00ff88',
          yellow: '#ffd700',
        },
      },
    },
  },
  plugins: [],
};

export default config;
