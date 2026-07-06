import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'

import config from '@/config.json'
import { filterDrafts } from '@/lib/utils'

export async function GET(context: { site: string }) {
  const { title, description } = config.pages.find((page) => page.href === '/blog')!
  const posts = await getCollection('blog', (entry) => filterDrafts(entry))
  const sortedPosts = posts.sort((a, b) => b.data.pubDate!.valueOf() - a.data.pubDate!.valueOf())

  return await rss({
    title,
    description,
    site: context.site,
    stylesheet: '/pretty-feed-v3.xsl',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/${post.id}/`
    }))
  })
}
