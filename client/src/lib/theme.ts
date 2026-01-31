// Banking theme color constants for Meridian Commercial Bank

export const colors = {
  // Primary - Navy Blue
  primary: {
    50: '#e6eef5',
    100: '#ccdcea',
    200: '#99b9d6',
    300: '#6697c1',
    400: '#3374ad',
    500: '#1e3a5f', // Main navy
    600: '#0f2744', // Dark navy
    700: '#0a1c30',
    800: '#05101c',
    900: '#020608',
  },
  // Accent - Gold
  accent: {
    50: '#fdf8e8',
    100: '#faf0d1',
    200: '#f5e1a3',
    300: '#f0d275',
    400: '#ebc347',
    500: '#d4af37', // Main gold
    600: '#c9a227', // Rich gold
    700: '#9a7b1e',
    800: '#6b5514',
    900: '#3c300b',
  },
  // Status colors
  success: {
    light: '#d1fae5',
    main: '#059669',
    dark: '#047857',
  },
  warning: {
    light: '#fef3c7',
    main: '#d97706',
    dark: '#b45309',
  },
  error: {
    light: '#fee2e2',
    main: '#dc2626',
    dark: '#b91c1c',
  },
  // Neutral grays
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// Tailwind class mappings for easy use
export const theme = {
  // Buttons
  button: {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 shadow-sm',
    accent: 'bg-accent-500 hover:bg-accent-600 text-primary-900 shadow-sm',
    danger: 'bg-error-main hover:bg-error-dark text-white shadow-sm',
  },
  // Status badges
  badge: {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    neutral: 'bg-slate-100 text-slate-800',
    primary: 'bg-sky-100 text-sky-800',
  },
  // Cards
  card: {
    base: 'bg-white rounded-xl shadow-sm border border-neutral-200',
    hover: 'bg-white rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow',
  },
  // Text
  text: {
    heading: 'text-primary-600 font-semibold',
    body: 'text-neutral-700',
    muted: 'text-neutral-500',
    link: 'text-accent-600 hover:text-accent-700',
  },
};

// Chart colors for Recharts
export const chartColors = {
  primary: '#1e3a5f',
  secondary: '#3374ad',
  accent: '#d4af37',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  // Gradient for area charts
  gradient: {
    start: '#1e3a5f',
    end: '#6697c1',
  },
  // Series colors for multi-line charts
  series: [
    '#1e3a5f', // Navy
    '#d4af37', // Gold
    '#059669', // Emerald
    '#3374ad', // Light navy
    '#c9a227', // Rich gold
    '#047857', // Dark emerald
  ],
};

// Bank branding
export const branding = {
  name: 'Meridian Commercial Bank',
  shortName: 'Meridian',
  tagline: 'Your Partner in Business Growth',
};
