import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
   
  darkMode: 'class', // Add this line
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['"EB Garamond"', 'Lora', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-out': 'fadeOut 0.3s ease-out forwards',
        'slide-in-top': 'slideInFromTop 0.3s ease-out forwards',
        'slide-in-right': 'slideInFromRight 0.3s ease-out forwards',
        'fade-in-out': 'fadeIn 0.2s ease-out forwards, fadeOut 0.2s ease-out 1.6s forwards',
        'modal-fade-in': 'modalFadeIn 0.2s ease-out forwards',
        'modal-slide-in': 'modalSlideIn 0.3s ease-out forwards',
        'tag-fade-in': 'tagFadeIn 0.3s ease-out forwards',
        'tag-fade-out': 'tagFadeOut 0.2s ease-in forwards',
        'fill-in': 'fillFromBottom 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'fade-in-slide-up': 'fadeInSlideUp 0.5s ease-out forwards',
  'fade-out-slide-down': 'fadeOutSlideDown 0.5s ease-out forwards',
  'bounce-once': 'bounceOnce 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(-8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeOut: {
          'from': { opacity: '1' },
          'to': { opacity: '0' }
        },
        slideInFromTop: {
          'from': { transform: 'translateY(-1rem)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInFromRight: {
          'from': { transform: 'translateX(1rem)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' }
        },
        modalFadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        fadeInSlideUp: {
            'from': { opacity: '0', transform: 'translateY(1rem)' },
            'to': { opacity: '1', transform: 'translateY(0)' }
          },
          fadeOutSlideDown: {
            'from': { opacity: '1', transform: 'translateY(0)' },
            'to': { opacity: '0', transform: 'translateY(1rem)' }
          },
          bounceOnce: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-0.25rem)' }
          },

        modalSlideIn: {
          'from': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        tagFadeIn: {
          'from': { opacity: '0', transform: 'scale(0.9)' },
          'to': { opacity: '1', transform: 'scale(1)' }
        },
        tagFadeOut: {
          'from': { opacity: '1', transform: 'scale(1)' },
          'to': { opacity: '0', transform: 'scale(0.9)' }
        },
        fillFromBottom: {
          '0%': { backgroundPosition: '0 100%', backgroundSize: '100% 0%' },
          '100%': { backgroundPosition: '0 0%', backgroundSize: '100% 100%' }
        }
      },
      colors: {
        'primary': {
          DEFAULT: '#8B5A2B',
          light: '#D2B48C',
          dark: '#4A3728'
        },
        'secondary': '#D2B48C',
        'accent': '#A0522D',
        'parchment': {
          light: '#FFFCEB',
          dark: '#F3E6C4',
        },
        'ink': '#2B1F10',
      },
      boxShadow: {
        'glow': '0 0 12px 4px rgba(255, 200, 0, 0.3)',
        'glow-hover': '0 0 12px 6px rgba(255, 170, 0, 0.9)',
      },
      transitionProperty: {
        'rotate': 'transform, rotate',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
   plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate') 
  ],
};

export default config;