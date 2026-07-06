import { type CollectionEntry, getCollection } from 'astro:content'

import config from '@/config.json'
import { filterDrafts, withBase } from '@/lib/utils'

const getLlmsTxt = (posts: CollectionEntry<'blog'>[], site: URL) => {
  const { description } = config.pages.find((page) => page.href === '/')!
  const links = posts.map((post) => {
    const postURL = new URL(withBase(`/blog/${post.id}.md`), site)
    return `- [${post.data.title}](${postURL.href})`
  })

  return `\
# ${config.name}

${description}

## Posts

${links.join('\n')}
`
}

export async function GET({ site }: { site: URL }) {
  const posts = await getCollection('blog', (entry) => filterDrafts(entry))
  const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

  return new Response(getLlmsTxt(sortedPosts, site), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
