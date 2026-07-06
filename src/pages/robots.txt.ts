// https://docs.astro.build/en/guides/integrations-guide/sitemap
import { withBase } from '@/lib/utils'

const getRobotsTxt = (sitemapURL: URL) => `\
User-agent: *
Allow: /
Sitemap: ${sitemapURL.href}
`

export function GET({ site }: { site: URL }) {
  const sitemapURL = new URL(withBase('/sitemap-index.xml'), site)
  return new Response(getRobotsTxt(sitemapURL), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
