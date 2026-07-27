/** @type {import('tailwind.config.js').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        atlantis: {
          50: '#ecfeff',
          100: '#cffaff',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          900: '#164e63',
          950: '#083344',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        abyss: {
          950: '#030712',
          900: '#0b1329',
          800: '#111e38',
          700: '#1e2d4a',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'atlantis-gradient': 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(20, 184, 166, 0.05))',
      },
    },
  },
  plugins: [],
};
