const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts,ttf}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],

  theme: {
    extend: {
      fontFamily: {
        'sans': ['InterVariable', 'Inter', 'sans-serif'],
        'serif': ['Merriweather', 'serif'],
      },
      colors: {
        'blue': {
          100: '#E3F3EA',
          200: '#E3F3EA',
          300: '#E3F3EA',
          400: '#357A54',
          500: '#357A54',
          600: '#357A54',
          700: '#357A54',
          800: '#357A54',
          900: '#357A54'
        }
      }
    }
  },

  plugins: [
    require('flowbite/plugin')
  ],
  darkMode: 'class',
};

module.exports = config;