import { type CollectionEntry, getCollection } from 'astro:content'
import rss from '@astrojs/rss'

import config from '@/config.json'
import { filterDrafts } from '@/lib/utils'

export async function GET(context: { site: string }) {
  const { title, description } = config.pages.find((page) => page.href === '/blog')!
  const posts: CollectionEntry<'blog'>[] = await getCollection(
    'blog',
    (entry: CollectionEntry<'blog'>) => filterDrafts(entry)
  )
  const sortedPosts: CollectionEntry<'blog'>[] = posts.sort(
    (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
      b.data.pubDate!.valueOf() - a.data.pubDate!.valueOf()
  )

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
