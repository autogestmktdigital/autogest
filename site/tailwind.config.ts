import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brothers: {
          dark: '#0b1220',
          gray: '#111827',
          green: '#b8d432',
        },
      },
    },
  },
  plugins: [],
};

export default config;