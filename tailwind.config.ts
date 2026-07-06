import typographyPlugin from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

type Theme = (path: string, defaultValue?: unknown) => string

// https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js
const typography = ({ theme }: { theme: Theme }) => ({
  // prose
  DEFAULT: {
    css: {
      maxWidth: null,

      // remove backticks from inline code
      'code::before': {
        content: '""'
      },
      'code::after': {
        content: '""'
      },

      // MDX wraps figcaption children in a <p> tag
      'figcaption > p': {
        marginTop: 0,
        marginBottom: 0
      },

      // give images same radius as code blocks
      '--prose-radius': theme('borderRadius.md'),
      img: {
        borderRadius: 'var(--prose-radius)'
      }
    }
  },
  // prose-sm
  sm: {
    css: {
      '--prose-radius': theme('borderRadius.DEFAULT')
    }
  },
  // prose-lg
  lg: {
    css: {
      '--prose-radius': theme('borderRadius.md')
    }
  },
  // prose-xl
  xl: {
    css: {
      '--prose-radius': theme('borderRadius.lg')
    }
  },
  // prose-2xl
  '2xl': {
    css: {
      '--prose-radius': theme('borderRadius.lg')
    }
  }
})

const config: Config = {
  content: [
    './astro.config.ts',
    './content/**/*.{md,mdx}',
    './src/components/**/*.{astro,tsx}',
    './src/layouts/**/*.astro',
    './src/pages/**/*.astro'
  ],
  darkMode: 'class',
  plugins: [typographyPlugin],
  theme: {
    extend: {
      typography,
      fontFamily: {
        sans: ['SourceSans3Variable', ...defaultTheme.fontFamily.sans],
        mono: ['SourceCodeProVariable', ...defaultTheme.fontFamily.mono],
        serif: ['SourceSerif4Variable', ...defaultTheme.fontFamily.serif]
      }
    }
  }
}

export default config
