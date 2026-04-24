import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#525252',
          500: '#262626',
          600: '#171717',
          700: '#0f0f0f',
          800: '#080808',
          900: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}

export default config
