/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',       // gray-50 / slate-900 dark
        foreground: 'var(--color-foreground)',       // slate-800 / slate-100 dark
        border: 'var(--color-border)',               // slate-200 / slate-700 dark
        input: 'var(--color-input)',                 // slate-200 / slate-700 dark
        ring: 'var(--color-ring)',                   // blue-600 / blue-500 dark

        card: {
          DEFAULT: 'var(--color-card)',              // white / slate-800 dark
          foreground: 'var(--color-card-foreground)', // slate-700 / slate-300 dark
        },

        popover: {
          DEFAULT: 'var(--color-popover)',           // white / slate-800 dark
          foreground: 'var(--color-popover-foreground)', // slate-800 / slate-100 dark
        },

        muted: {
          DEFAULT: 'var(--color-muted)',             // slate-100 / slate-700 dark
          foreground: 'var(--color-muted-foreground)', // slate-500 / slate-400 dark
        },

        primary: {
          DEFAULT: 'var(--color-primary)',           // blue-600 / blue-500 dark
          foreground: 'var(--color-primary-foreground)', // white
        },

        secondary: {
          DEFAULT: 'var(--color-secondary)',         // slate-500 / slate-400 dark
          foreground: 'var(--color-secondary-foreground)', // white / slate-900 dark
        },

        accent: {
          DEFAULT: 'var(--color-accent)',            // violet-700 / violet-500 dark
          foreground: 'var(--color-accent-foreground)', // white
        },

        destructive: {
          DEFAULT: 'var(--color-destructive)',       // red-600 / red-500 dark
          foreground: 'var(--color-destructive-foreground)', // white
        },

        error: {
          DEFAULT: 'var(--color-error)',             // red-600 / red-500 dark
          foreground: 'var(--color-error-foreground)', // white
        },

        success: {
          DEFAULT: 'var(--color-success)',           // emerald-600 / emerald-500 dark
          foreground: 'var(--color-success-foreground)', // white
        },

        warning: {
          DEFAULT: 'var(--color-warning)',           // amber-600 / amber-500 dark
          foreground: 'var(--color-warning-foreground)', // white
        },

        surface: {
          DEFAULT: 'var(--color-surface)',           // white / slate-800 dark
          foreground: 'var(--color-surface-foreground)', // slate-700 / slate-300 dark
        },

        // Category colors
        work: 'var(--color-work)',                   // blue-600
        health: 'var(--color-health)',               // emerald-600
        learning: 'var(--color-learning)',           // violet-700
        faith: 'var(--color-faith)',                 // amber-600
        family: 'var(--color-family)',               // pink-500
        social: 'var(--color-social)',               // sky-500
        creative: 'var(--color-creative)',           // orange-500
        finance: 'var(--color-finance)',             // teal-500
        personal: 'var(--color-personal)',           // violet-500
      },

      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        caption: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
        home: ['Nunito', 'sans-serif'],
        sans: ['Source Sans 3', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'display-1': ['2.25rem', { lineHeight: '1.2' }],
        'display-2': ['1.875rem', { lineHeight: '1.25' }],
        'display-3': ['1.5rem', { lineHeight: '1.3' }],
        'display-4': ['1.25rem', { lineHeight: '1.4' }],
        'display-5': ['1.125rem', { lineHeight: '1.5' }],
        'body-base': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'caption-xs': ['0.6875rem', { lineHeight: '1' }],
      },

      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        DEFAULT: '12px',
      },

      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
      },

      height: {
        'top-bar': '64px',
        'bottom-nav': '64px',
        'btn': '48px',
        'input': '44px',
        'row': '52px',
      },

      minHeight: {
        'touch': '44px',
      },

      minWidth: {
        'touch': '44px',
      },

      zIndex: {
        'base': '0',
        'card': '1',
        'dropdown': '50',
        'sticky': '40',
        'bottom-nav': '30',
        'modal-backdrop': '45',
        'modal': '50',
        'toast': '300',
      },

      boxShadow: {
        'theme-sm': '0 1px 3px rgba(15, 23, 42, 0.08)',
        'theme-md': '0 2px 8px rgba(15, 23, 42, 0.10)',
        'theme-lg': '0 4px 16px rgba(15, 23, 42, 0.12)',
        'theme-xl': '0 20px 25px -5px rgba(15, 23, 42, 0.16)',
        'dark-sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 2px 8px rgba(0, 0, 0, 0.35)',
        'dark-lg': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        'smooth': '250ms',
      },

      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'modal-enter': 'modal-enter 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'time-pulse': 'time-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'home-bounce': 'home-bounce 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite',
        'home-wiggle': 'home-wiggle 1.2s ease-in-out infinite',
        'home-fade': 'home-fade 2s ease-in-out infinite',
        'home-pop': 'home-pop 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'glow-text': 'glow-text 3s ease-in-out infinite',
        'glow-border': 'glow-border 4s ease-in-out infinite',
        'float-glow': 'float-glow 3s ease-in-out infinite',
      },

      keyframes: {
        'skeleton-pulse': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'modal-enter': {
          from: { opacity: '0', transform: 'translateY(-12px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'time-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'home-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
          '60%': { transform: 'translateY(-3px)' },
        },
        'home-wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'home-fade': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.97)' },
        },
        'home-pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.12)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 6px 1px rgba(99,102,241,0.25), 0 0 12px 2px rgba(139,92,246,0.15)' },
          '50%': { boxShadow: '0 0 14px 3px rgba(99,102,241,0.45), 0 0 28px 6px rgba(139,92,246,0.3)' },
        },
        'glow-text': {
          '0%, 100%': { textShadow: '0 0 8px rgba(139,92,246,0.3), 0 0 16px rgba(99,102,241,0.2)' },
          '50%': { textShadow: '0 0 16px rgba(139,92,246,0.6), 0 0 32px rgba(99,102,241,0.4)' },
        },
        'glow-border': {
          '0%, 100%': { borderColor: 'rgba(99,102,241,0.3)', boxShadow: '0 0 8px rgba(99,102,241,0.2)' },
          '50%': { borderColor: 'rgba(139,92,246,0.7)', boxShadow: '0 0 20px rgba(139,92,246,0.5)' },
        },
        'float-glow': {
          '0%, 100%': { transform: 'translateY(0)', filter: 'drop-shadow(0 0 4px rgba(139,92,246,0.3))' },
          '50%': { transform: 'translateY(-5px)', filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.6))' },
        },
      },

      maxWidth: {
        'prose': '70ch',
        'modal': '560px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};