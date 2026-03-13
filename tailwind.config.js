/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#208AEF',
        income: '#22C55E',
        expense: '#EF4444',
        warning: '#F59E0B',
        // Light theme tokens
        'surface-light': '#F0F0F3',
        'surface-selected-light': '#E0E1E6',
        'text-secondary-light': '#60646C',
        // Dark theme tokens
        'surface-dark': '#212225',
        'surface-selected-dark': '#2E3135',
        'text-secondary-dark': '#B0B4BA',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      spacing: {
        0.5: '2px',
        1: '4px',
        2: '8px',
        4: '16px',
        6: '24px',
        8: '32px',
        16: '64px',
      },
    },
  },
  plugins: [],
};
