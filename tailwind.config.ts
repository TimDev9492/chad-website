import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      screens: {
        portrait: {
          raw: '(orientation: portrait)',
        },
        landscape: {
          raw: '(orientation: landscape)',
        },
      },
    },
  },

  plugins: [typography, forms],
} satisfies Config;
