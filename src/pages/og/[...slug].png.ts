import { getCollection } from 'astro:content'
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js'
import type { ReactNode } from 'react'
import satori, { type FontStyle, type FontWeight, type SatoriOptions } from 'satori'

import config from '@/config.json'
import { filterDrafts, withBase } from '@/lib/utils'

type RemoteFont = {
  id: string
  name: string
  style: FontStyle
  weight: FontWeight
}

type OpenGraphImageProps = {
  description: string
  title: string
  url: string
}

const [notFound] = Object.values(import.meta.glob('../404.astro', { eager: true })) as [
  {
    title: string
    description: string
  }
]

const [host, domain] = config.website.split('.')

const width = 1200
const height = 630

const colors = {
  primary: '#e5e5e5', // oklch(0.922 0 0)
  foreground: '#fafafa', // oklch(0.985 0 0)
  mutedForeground: '#a1a1a1', // oklch(0.708 0 0)
  background: '#000000', // oklch(0 0 0)
  card: '#171717' // oklch(0.205 0 0)
}

const sansFont = { id: 'source-sans-3', name: 'Source Sans 3' }
const monoFont = { id: 'source-code-pro', name: 'Source Code Pro' }
const fontSourceUrl = (font: string, weight: FontWeight, style: FontStyle) =>
  `https://cdn.jsdelivr.net/fontsource/fonts/${font}@latest/latin-${weight}-${style}.woff`

// The site uses variable-weight fonts which are only WOFF2.
// Satori doesn't support WOFF2 so we fetch static-weight WOFF fonts instead.
const remoteFonts: RemoteFont[] = [
  { ...sansFont, weight: 400, style: 'normal' },
  { ...sansFont, weight: 700, style: 'normal' },
  { ...monoFont, weight: 400, style: 'normal' }
]

const fonts = await Promise.all(
  remoteFonts.map(async (font) => {
    const url = fontSourceUrl(font.id, font.weight, font.style)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${font.name} ${font.weight} from ${url}: ${response.status}`)
    }

    return {
      name: font.name,
      weight: font.weight,
      style: font.style,
      data: await response.arrayBuffer()
    }
  })
)

const satoriOptions = {
  fonts,
  width,
  height
} satisfies SatoriOptions

const resvgOptions = {
  fitTo: {
    mode: 'width',
    value: width
  }
} satisfies ResvgRenderOptions

const getSlug = (href: string) => (href === '/' ? 'index' : href.replace(/^\//, ''))
const getUrl = (path: string) => new URL(withBase(path), import.meta.env.SITE).toString()

export const getStaticPaths = async () => {
  const { title, description } = notFound
  const pages = [...config.pages, { href: '/404', title, description }].map((page) => ({
    params: { slug: getSlug(page.href) },
    props: {
      title: page.title,
      description: page.description,
      url: getUrl(page.href)
    }
  }))

  const posts = await getCollection('blog', (entry) => filterDrafts(entry))

  return [
    ...pages,
    ...posts.map((post) => ({
      params: { slug: `blog/${post.id}` },
      props: {
        title: post.data.title,
        description: post.data.description,
        url: getUrl(`/blog/${post.id}`)
      }
    }))
  ]
}

export const GET = async ({ props }: { props: OpenGraphImageProps }) => {
  const markup = {
    type: 'div',
    props: {
      tw: 'relative h-full w-full flex flex-col justify-end overflow-hidden bg-black p-20',
      style: {
        backgroundImage: `linear-gradient(135deg, ${colors.background} 0%, ${colors.card} 54%, ${colors.mutedForeground} 100%)`,
        fontFamily: sansFont.name
      },
      children: [
        {
          type: 'svg',
          props: {
            tw: 'absolute inset-0',
            width,
            height,
            viewBox: `0 0 ${width} ${height}`,
            children: [
              {
                type: 'defs',
                props: {
                  children: [
                    {
                      type: 'pattern',
                      props: {
                        id: 'grid',
                        width: '44',
                        height: '44',
                        patternUnits: 'userSpaceOnUse',
                        children: {
                          type: 'path',
                          props: {
                            d: 'M 44 0 L 0 0 0 44',
                            fill: 'none',
                            stroke: colors.mutedForeground,
                            strokeWidth: '1.25'
                          }
                        }
                      }
                    },
                    {
                      type: 'radialGradient',
                      props: {
                        id: 'grid-fade',
                        cx: '100%',
                        cy: '0%',
                        r: '86%',
                        children: [
                          {
                            type: 'stop',
                            props: { offset: '0%', stopColor: 'white', stopOpacity: '0.48' }
                          },
                          {
                            type: 'stop',
                            props: { offset: '42%', stopColor: 'white', stopOpacity: '0.18' }
                          },
                          {
                            type: 'stop',
                            props: { offset: '78%', stopColor: 'white', stopOpacity: '0' }
                          }
                        ]
                      }
                    },
                    {
                      type: 'mask',
                      props: {
                        id: 'grid-mask',
                        children: {
                          type: 'rect',
                          props: { width, height, fill: 'url(#grid-fade)' }
                        }
                      }
                    }
                  ]
                }
              },
              {
                type: 'rect',
                props: { width, height, fill: 'url(#grid)', mask: 'url(#grid-mask)' }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            tw: 'absolute left-20 top-18 flex text-[28px] font-black leading-none',
            style: { letterSpacing: '-0.06em' },
            children: [
              { type: 'span', props: { style: { color: colors.foreground }, children: `${host}` } },
              {
                type: 'span',
                props: { style: { color: colors.mutedForeground }, children: `.${domain}` }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            tw: 'flex flex-col',
            children: [
              {
                type: 'div',
                props: {
                  tw: 'max-w-[920px] text-[86px] font-normal leading-[0.95]',
                  style: { color: colors.foreground, letterSpacing: '-0.035em' },
                  children: props.title
                }
              },
              {
                type: 'div',
                props: {
                  tw: 'mt-8 max-w-[880px] text-[34px] leading-[1.2]',
                  style: { color: colors.primary },
                  children: props.description
                }
              },
              {
                type: 'div',
                props: {
                  tw: 'mt-8 text-[24px] leading-none',
                  style: { color: colors.mutedForeground, fontFamily: monoFont.name },
                  children: props.url
                }
              }
            ]
          }
        }
      ]
    }
  } as ReactNode

  const svg = await satori(markup, satoriOptions)
  const image = new Resvg(svg, resvgOptions).render().asPng()
  const body = image.buffer.slice(
    image.byteOffset,
    image.byteOffset + image.byteLength
  ) as ArrayBuffer

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png'
    }
  })
}
