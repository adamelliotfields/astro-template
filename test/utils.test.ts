import type { CollectionEntry } from 'astro:content'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  filterDrafts,
  formatDate,
  openGraphImagePath,
  trimTrailingSlash,
  withBase
} from '@/lib/utils'

type BlogEntry = CollectionEntry<'blog'>

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('trimTrailingSlash', () => {
  it('removes one trailing slash', () => {
    expect(trimTrailingSlash('/blog/')).toBe('/blog')
    expect(trimTrailingSlash('https://example.com/')).toBe('https://example.com')
  })

  it('leaves strings without a trailing slash unchanged', () => {
    expect(trimTrailingSlash('/blog')).toBe('/blog')
  })
})

describe('withBase', () => {
  it('keeps internal paths rooted when BASE_URL is /', () => {
    vi.stubEnv('BASE_URL', '/')

    expect(withBase('/blog')).toBe('/blog')
    expect(withBase('blog')).toBe('/blog')
  })

  it('prefixes internal paths with BASE_URL', () => {
    vi.stubEnv('BASE_URL', '/astro-template/')

    expect(withBase('/blog')).toBe('/astro-template/blog')
    expect(withBase('blog')).toBe('/astro-template/blog')
  })

  it('normalizes BASE_URL without a trailing slash', () => {
    vi.stubEnv('BASE_URL', '/astro-template')

    expect(withBase('/blog')).toBe('/astro-template/blog')
  })

  it('leaves external and special URLs unchanged', () => {
    vi.stubEnv('BASE_URL', '/astro-template/')

    expect(withBase('https://example.com')).toBe('https://example.com')
    expect(withBase('//example.com')).toBe('//example.com')
    expect(withBase('mailto:me@example.com')).toBe('mailto:me@example.com')
    expect(withBase('tel:+15555555555')).toBe('tel:+15555555555')
    expect(withBase('#main')).toBe('#main')
  })
})

describe('openGraphImagePath', () => {
  it('maps the root route to the index image', () => {
    vi.stubEnv('BASE_URL', '/')

    expect(openGraphImagePath('/')).toBe('/og/index.png')
  })

  it('maps routes to generated image paths', () => {
    vi.stubEnv('BASE_URL', '/')

    expect(openGraphImagePath('/about')).toBe('/og/about.png')
    expect(openGraphImagePath('/blog/post/')).toBe('/og/blog/post.png')
  })

  it('removes the configured base before mapping routes', () => {
    vi.stubEnv('BASE_URL', '/astro-template/')

    expect(openGraphImagePath('/astro-template/')).toBe('/og/index.png')
    expect(openGraphImagePath('/astro-template/blog/post')).toBe('/og/blog/post.png')
  })
})

describe('filterDrafts', () => {
  it('keeps drafts outside production', () => {
    vi.stubEnv('PROD', false)
    const entry = { data: { draft: true } } as BlogEntry

    expect(filterDrafts(entry)).toBe(true)
  })

  it('filters drafts in production', () => {
    vi.stubEnv('PROD', true)
    const entry = { data: { draft: true } } as BlogEntry

    expect(filterDrafts(entry)).toBe(false)
  })

  it('keeps published posts in production', () => {
    vi.stubEnv('PROD', true)
    const entry = { data: { draft: false } } as BlogEntry
    const entryWithoutDraft = { data: {} } as BlogEntry

    expect(filterDrafts(entry)).toBe(true)
    expect(filterDrafts(entryWithoutDraft)).toBe(true)
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    expect(formatDate('2026-01-01')).toBe('January 1, 2026')
  })

  it('formats a Date object', () => {
    expect(formatDate(new Date('2026-01-01T12:34:56Z'))).toBe('January 1, 2026')
  })

  it('treats date-only strings as UTC', () => {
    expect(formatDate('2026-06-29')).toBe('June 29, 2026')
  })

  it('throws for invalid dates', () => {
    expect(() => formatDate('not-a-date')).toThrow('Invalid Date')
  })
})
