import { type CollectionEntry, getCollection } from 'astro:content'
import type { GetStaticPaths } from 'astro'

import { filterDrafts } from '@/lib/utils'

type Post = CollectionEntry<'blog'>

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', (entry) => filterDrafts(entry))

  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post }
  }))
}

export function GET({ props }: { props: { post: Post } }) {
  const title = props.post.data.title ?? ''
  const body = props.post.body ?? ''

  return new Response(`# ${title}\n\n${body}`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8'
    }
  })
}
