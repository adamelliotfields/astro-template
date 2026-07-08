import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap, { type SitemapItem } from '@astrojs/sitemap'
import tailwind from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import pagefind from 'astro-pagefind'
import rehypeAutolinkHeadings, {
  type Options as RehypeAutolinkHeadingsOptions
} from 'rehype-autolink-headings'
import rehypeExternalLinks, {
  type Options as RehypeExternalLinksOptions
} from 'rehype-external-links'
import rehypeMathjax from 'rehype-mathjax'
import remarkGemoji from 'remark-gemoji'
import { remarkAlert } from 'remark-github-blockquote-alert'
import remarkMath from 'remark-math'

import config from './src/config.json'

const { pathname, origin: site } = import.meta.env.DEV
  ? new URL('http://localhost:4321')
  : new URL(config.origin)
const base = pathname === '/' ? undefined : pathname

const getTextContent = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  if ('value' in node && typeof node.value === 'string') return node.value
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(getTextContent).join('')
  }
  return ''
}

const serialize = (item: SitemapItem): SitemapItem => {
  const siteURL = `${site}${base ?? ''}`
  const priorityBy = {
    [`${siteURL}/`]: 0.7,
    [`${siteURL}/about/`]: 0.8,
    [`${siteURL}/resume/`]: 0.8,
    [`${siteURL}/blog/`]: 0.9
  }
  const priority = priorityBy[item.url as keyof typeof priorityBy] ?? 0.6
  const lastmod = new Date().toISOString().slice(0, 10)
  return { ...item, priority, lastmod }
}

const externalLinkOptions = {
  target: '_blank',
  rel: ['noopener', 'noreferrer'],
  protocols: ['http', 'https', 'mailto', 'tel'],
  test(element) {
    const href = element.properties?.href
    if (typeof href !== 'string') return true
    return !href.startsWith(`${site}${base ?? ''}`)
  },
  properties(element) {
    const text = getTextContent(element).trim()
    return {
      ariaLabel: `${text || 'External link'} (opens in a new tab)`
    }
  },
  // Lucide external-link icon in HAST format for Rehype
  contentProperties: { ariaHidden: 'true' },
  content: {
    type: 'element',
    tagName: 'svg',
    properties: {
      className: [
        'inline-block',
        'size-3',
        'ml-0.5',
        '-translate-y-px',
        'text-[var(--tw-prose-body)]',
        'dark:text-[var(--tw-prose-invert-body)]'
      ],
      ariaHidden: 'true',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg'
    },
    children: [
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M15 3h6v6' },
        children: []
      },
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M10 14 21 3' },
        children: []
      },
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' },
        children: []
      }
    ]
  }
} satisfies RehypeExternalLinksOptions

const headingLinkOptions = {
  behavior: 'append',
  properties(element) {
    const text = getTextContent(element).trim()

    return {
      ariaLabel: `Link to ${text || 'this section'}`,
      className: [
        'not-prose',
        'ml-2',
        'font-mono',
        'font-normal',
        'text-muted-foreground',
        'opacity-0',
        'transition-opacity',
        'hover:opacity-100',
        'focus:opacity-100',
        'group-hover:opacity-100'
      ]
    }
  },
  headingProperties: {
    className: ['group', 'scroll-mt-12']
  },
  content: {
    type: 'text',
    value: '#'
  }
} satisfies RehypeAutolinkHeadingsOptions

// https://astro.build/config
export default defineConfig({
  site,
  base,
  compressHTML: import.meta.env.PROD,
  build: { inlineStylesheets: 'never' }, // doesn't work with tailwind
  prefetch: { defaultStrategy: 'tap' },
  devToolbar: { enabled: false },
  integrations: [react(), mdx(), pagefind(), sitemap({ serialize })],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkGemoji,
        [remarkMath, { singleDollarTextMath: true }],
        [remarkAlert, { classNames: 'not-prose font-sans', legacyTitle: true }]
      ],
      rehypePlugins: [
        rehypeMathjax,
        rehypeHeadingIds,
        [rehypeAutolinkHeadings, headingLinkOptions],
        [rehypeExternalLinks, externalLinkOptions]
      ]
    }),
    shikiConfig: {
      wrap: false,
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      }
    }
  },
  vite: {
    plugins: [tailwind()]
  }
})
