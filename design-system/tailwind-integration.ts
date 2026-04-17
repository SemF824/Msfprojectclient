/**
 * MSF CONGO - TAILWIND CSS INTEGRATION
 *
 * Configuration complète pour intégrer la palette MSF Congo dans Tailwind CSS
 *
 * Usage:
 * 1. Importez ce fichier dans votre tailwind.config.js
 * 2. Utilisez les classes Tailwind standard avec vos couleurs de marque
 *
 * Example:
 * import { msfCongoTheme } from './design-system/tailwind-integration';
 *
 * export default {
 *   theme: {
 *     extend: msfCongoTheme
 *   }
 * }
 */

export const msfCongoTheme = {
  colors: {
    // Brand Colors
    'brand-dark': {
      50: '#f4f5f7',
      100: '#e8eaed',
      200: '#c8cdd6',
      300: '#9ba3b3',
      400: '#6b7690',
      500: '#4a536e',
      600: '#303855',
      700: '#1e2840',
      800: '#131a2f',
      900: '#0a0f1e', // Original
      950: '#050810',
      DEFAULT: '#0a0f1e',
    },
    'brand-gold': {
      50: '#fdf9ed',
      100: '#faf3db',
      200: '#f4e3b2', // Used in gradients
      300: '#eed388',
      400: '#e1c05f',
      500: '#d4af37', // Original
      600: '#b8952e',
      700: '#937726',
      800: '#6e591e',
      900: '#4a3c15',
      950: '#2d250d',
      DEFAULT: '#d4af37',
    },

    // Semantic Aliases (shortcuts)
    'primary': {
      DEFAULT: '#0a0f1e',
      light: '#131a2f',
      dark: '#050810',
    },
    'accent': {
      DEFAULT: '#d4af37',
      light: '#f4e3b2',
      dark: '#b8952e',
    },

    // Neutral Grays
    'neutral': {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // Alert Colors
    'success': {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      DEFAULT: '#22c55e',
    },
    'warning': {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      DEFAULT: '#f59e0b',
    },
    'error': {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      DEFAULT: '#ef4444',
    },
    'info': {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      DEFAULT: '#3b82f6',
    },
  },

  // Background colors
  backgroundColor: {
    'primary': '#0a0f1e',
    'primary-light': '#131a2f',
    'secondary': '#ffffff',
    'accent': '#d4af37',
    'accent-light': '#f4e3b2',
    'surface': '#ffffff',
    'surface-dark': '#1e2840',
    'surface-elevated': '#303855',
  },

  // Text colors
  textColor: {
    'primary': '#0a0f1e',
    'secondary': '#4a536e',
    'tertiary': '#6b7690',
    'helper': '#9ba3b3',
    'disabled': '#c8cdd6',
    'on-dark': {
      primary: '#ffffff',
      secondary: '#e8eaed',
      tertiary: '#c8cdd6',
      accent: '#f4e3b2',
    },
    'on-gold': '#2d250d',
    'on-gold-alt': '#0a0f1e',
  },

  // Border colors
  borderColor: {
    'primary': '#e5e5e5',
    'secondary': '#d4d4d4',
    'focus': '#d4af37',
    'dark': {
      primary: '#303855',
      secondary: '#4a536e',
    },
    'accent': '#eed388',
  },

  // Box shadows with brand colors
  boxShadow: {
    'sm': '0 1px 2px 0 rgba(10, 15, 30, 0.05)',
    'DEFAULT': '0 1px 3px 0 rgba(10, 15, 30, 0.1), 0 1px 2px -1px rgba(10, 15, 30, 0.1)',
    'md': '0 4px 6px -1px rgba(10, 15, 30, 0.1), 0 2px 4px -1px rgba(10, 15, 30, 0.06)',
    'lg': '0 10px 15px -3px rgba(10, 15, 30, 0.1), 0 4px 6px -2px rgba(10, 15, 30, 0.05)',
    'xl': '0 20px 25px -5px rgba(10, 15, 30, 0.1), 0 10px 10px -5px rgba(10, 15, 30, 0.04)',
    '2xl': '0 25px 50px -12px rgba(10, 15, 30, 0.25)',
    'inner': 'inset 0 2px 4px 0 rgba(10, 15, 30, 0.06)',
    'none': 'none',

    // Gold accent shadows
    'gold-sm': '0 4px 12px rgba(212, 175, 55, 0.2)',
    'gold': '0 8px 24px rgba(212, 175, 55, 0.3)',
    'gold-md': '0 8px 24px rgba(212, 175, 55, 0.3)',
    'gold-lg': '0 20px 40px rgba(212, 175, 55, 0.4)',

    // Focus shadow
    'focus': '0 0 0 3px #d4af37',
  },

  // Background gradients
  backgroundImage: {
    'gradient-gold': 'linear-gradient(to right, #d4af37, #f4e3b2)',
    'gradient-gold-vertical': 'linear-gradient(to bottom, #d4af37, #f4e3b2)',
    'gradient-dark-blue': 'linear-gradient(to bottom, #0a0f1e, rgba(30, 58, 95, 0.2))',
    'gradient-dark-overlay': 'linear-gradient(to top, #0a0f1e, transparent, transparent)',
    'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  },

  // Ring colors for focus states
  ringColor: {
    'DEFAULT': '#d4af37',
    'gold': '#d4af37',
    'gold-light': '#f4e3b2',
  },

  // Ring offset colors
  ringOffsetColor: {
    'primary': '#0a0f1e',
    'secondary': '#ffffff',
  },
};

/**
 * Utility classes for common patterns
 * Add these to your Tailwind config plugins section
 */
export const msfCongoUtilities = {
  // Text gradient utilities
  '.text-gradient-gold': {
    background: 'linear-gradient(to right, #d4af37, #f4e3b2)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    'background-clip': 'text',
  },

  // Glass morphism effect
  '.glass-effect': {
    background: 'rgba(255, 255, 255, 0.1)',
    'backdrop-filter': 'blur(10px)',
    '-webkit-backdrop-filter': 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },

  '.glass-effect-dark': {
    background: 'rgba(10, 15, 30, 0.7)',
    'backdrop-filter': 'blur(10px)',
    '-webkit-backdrop-filter': 'blur(10px)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
  },

  // Button base styles
  '.btn-base': {
    padding: '12px 24px',
    'border-radius': '12px',
    'font-weight': '600',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  '.btn-primary': {
    background: 'linear-gradient(to right, #d4af37, #f4e3b2)',
    color: '#0a0f1e',
    border: 'none',
    '&:hover': {
      'box-shadow': '0 8px 24px rgba(212, 175, 55, 0.4)',
      transform: 'translateY(-2px)',
    },
  },

  '.btn-secondary': {
    background: 'transparent',
    color: '#d4af37',
    border: '2px solid #d4af37',
    '&:hover': {
      background: 'rgba(212, 175, 55, 0.1)',
    },
  },

  // Focus visible for accessibility
  '.focus-visible-ring': {
    '&:focus-visible': {
      outline: '3px solid #d4af37',
      'outline-offset': '2px',
    },
    '&:focus:not(:focus-visible)': {
      outline: 'none',
    },
  },

  // Screen reader only
  '.sr-only': {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    'white-space': 'nowrap',
    'border-width': '0',
  },
};

/**
 * Complete Tailwind config example
 */
export const completeTailwindConfig = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      ...msfCongoTheme,
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      addUtilities(msfCongoUtilities);
    },
  ],
};

export default msfCongoTheme;
