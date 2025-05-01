/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'source-primary': '#8B5A2B',
        'source-secondary': '#D2B48C',
        'source-accent': '#A0522D',
        'source-light': '#F5F5DC',
        'source-dark': '#4A3728',
        'parchment-light': '#FFFCEB',
        'parchment-dark': '#F3E6C4',
        'ink': '#2B1F10',
      },
      fontFamily: {
        'serif': ['EB Garamond', 'Lora', 'serif'],
        'sans': ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};