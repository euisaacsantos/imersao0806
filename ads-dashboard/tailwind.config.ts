import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#ff6500',
          light: '#ff8c42',
          muted: '#ff6500',
        },
        surface: {
          DEFAULT: '#111111',
          raised: '#1a1a1a',
          hover: '#222222',
          border: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
}
export default config
