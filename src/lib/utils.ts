import type { CollectionEntry } from 'astro:content'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge and join class names. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Remove trailing forward slashes from paths. */
export function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '')
}

/** Prefix internal paths with Astro's configured base URL. */
export function withBase(path: string) {
  // Detect external URL-like paths
  if (
    /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path) ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('#')
  ) {
    return path
  }

  const base = import.meta.env.BASE_URL
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path

  return `${normalizedBase}${normalizedPath}`
}

/** Build the generated OpenGraph image path for a request pathname. */
export function openGraphImagePath(pathname: string) {
  const base = trimTrailingSlash(import.meta.env.BASE_URL)
  const slug = trimTrailingSlash(pathname.slice(base.length)) || '/index'

  return `/og${slug}.png`
}

/** Filter out draft entries. */
export function filterDrafts(entry: CollectionEntry<'blog'>): boolean {
  const isDraft = import.meta.env.PROD
    ? (entry as CollectionEntry<'blog'>).data.draft === true
    : false
  return !isDraft
}

/** Make a date human-readable. */
export function formatDate(date: string | Date, format: 'long' | 'short' = 'long'): string {
  const dateString = typeof date === 'string' ? date : date.toISOString()
  const hasTime = dateString.includes('T')
  const hasTimeZone = /Z|[+-]\d{2}:\d{2}$/.test(dateString)
  const fullDateString = hasTime || hasTimeZone ? dateString : `${dateString}T00:00:00Z`
  const newDate = new Date(fullDateString)

  if (String(newDate) === 'Invalid Date') throw new Error('Invalid Date')

  // short format is ISO 8601 (YYYY-MM-DD)
  if (format === 'short') return newDate.toISOString().split('T').at(0) as string

  return newDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}
