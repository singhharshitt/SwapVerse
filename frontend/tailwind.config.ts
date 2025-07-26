import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        open: ['"Open Sans"', 'sans-serif'],
        bitter: ['"Bitter"', 'serif'],
        nunito: ['"Nunito"', 'sans-serif'],
        libertinus: ['"Libertinus Mono"', 'monospace'],
        wink: ['"Winky Rough"', 'cursive'],

        // ✅ Newly added fonts:
        bebas: ['"Bebas Neue"', 'sans-serif'],
        lobster: ['"Lobster Two"', 'cursive'],
        montserrat: ['"Montserrat"', 'sans-serif'],
        pacifico: ['"Pacifico"', 'cursive'],
        roboto: ['"Roboto"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
