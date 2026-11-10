import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pink:   { DEFAULT: '#FF6B9D', dark: '#E22E73', light: '#FFC9E0' },
        purple: { DEFAULT: '#9D4EDD', dark: '#7A1AC9', light: '#C8A4FF' },
        sky:    { DEFAULT: '#4CC9F0' },
        sun:    { DEFAULT: '#FFD93D' },
        mint:   { DEFAULT: '#06D6A0', dark: '#059873' },
        coral:  { DEFAULT: '#FF8E72' },
        cream:  { DEFAULT: '#FFF8E7' },
        navy:   { DEFAULT: '#1a1a2e', 2: '#241548' },
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body:    ['Fredoka', 'system-ui', 'sans-serif'],
        code:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        'chunk':      '0 8px 0 rgba(0,0,0,.08), 0 20px 50px rgba(59,30,99,.15)',
        'chunk-pink': '0 8px 0 #E22E73, 0 16px 40px rgba(255,107,157,.3)',
        'chunk-mint': '0 8px 0 #059873',
      },
    },
  },
  plugins: [],
};

export default config;
