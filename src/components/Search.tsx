'use client'

import { ArrowRightIcon, CornerDownLeftIcon, FileTextIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { withBase } from '@/lib/utils'

type SearchPage = {
  href: string
  title: string
}

type SearchPost = {
  href: string
  title: string
}

type SearchProps = {
  pages: SearchPage[]
  posts: SearchPost[]
}

type PagefindResult = {
  id: string
  data: () => Promise<PagefindData>
}

type PagefindData = {
  url: string
  excerpt: string
  meta: {
    title?: string
  }
}

type Pagefind = {
  search: (query: string) => Promise<{ results: PagefindResult[] }>
}

const MAX_RESULTS = 8

let pagefindPromise: Promise<Pagefind> | undefined

function loadPagefind() {
  pagefindPromise ??= import(
    /* @vite-ignore */ withBase('/pagefind/pagefind.js')
  ) as Promise<Pagefind>
  return pagefindPromise
}

function getPlainText(value: string) {
  return value.replace(/<[^>]*>/g, '')
}

function getFooterText(
  selectedValue: string,
  pages: SearchPage[],
  posts: SearchPost[],
  results: PagefindData[]
) {
  if (!selectedValue) return ''

  if (selectedValue.startsWith(withBase('/blog/'))) {
    const post = posts.find((item) => withBase(item.href) === selectedValue)
    const result = results.find((item) => withBase(item.url) === selectedValue)
    return `Read the "${post?.title ?? result?.meta.title ?? selectedValue}" post`
  }

  const page = pages.find((item) => withBase(item.href) === selectedValue)
  return `Go to the ${page?.title ?? selectedValue} page`
}

export default function Search({ pages, posts }: SearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedValue, setSelectedValue] = useState('')
  const [results, setResults] = useState<PagefindData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const footerText = getFooterText(selectedValue, pages, posts, results)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || (!event.ctrlKey && !event.metaKey)) return
      event.preventDefault()
      setOpen((current) => !current)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    setSelectedValue('')

    if (!open || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      setError(false)
      return
    }

    let cancelled = false

    const timeout = window.setTimeout(async () => {
      setLoading(true)
      setError(false)

      try {
        const pagefind = await loadPagefind()
        const search = await pagefind.search(query)
        const data = await Promise.all(
          search.results.slice(0, MAX_RESULTS).map((result) => result.data())
        )
        if (!cancelled) {
          setResults(data)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setResults([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, 150)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [open, query])

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="cursor-pointer rounded-full text-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <SearchIcon width="1.125em" height="1.125em" strokeWidth={1.5} />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search site content"
        className="pb-11 sm:max-w-xl"
      >
        <Command shouldFilter={false} loop value={selectedValue} onValueChange={setSelectedValue}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search posts..." />
          <CommandList className="max-h-96">
            {query.trim().length < 2 ? (
              <>
                <CommandGroup heading="PAGES">
                  {pages.map((page) => {
                    const href = withBase(page.href)
                    return (
                      <CommandItem
                        key={page.href}
                        value={href}
                        onSelect={() => {
                          window.location.href = href
                        }}
                      >
                        <ArrowRightIcon />
                        {page.title}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
                <CommandGroup heading="POSTS">
                  {posts.map((post) => {
                    const href = withBase(post.href)
                    return (
                      <CommandItem
                        key={post.href}
                        value={href}
                        onSelect={() => {
                          window.location.href = href
                        }}
                      >
                        <FileTextIcon />
                        {post.title}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            ) : loading ? (
              <CommandEmpty>Searching...</CommandEmpty>
            ) : error ? (
              <CommandEmpty>Search is unavailable. Try building the site first.</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              results.map((result) => {
                const href = withBase(result.url)
                const title = result.meta.title ?? result.url
                return (
                  <CommandItem
                    key={result.url}
                    value={href}
                    onSelect={() => {
                      window.location.href = href
                    }}
                    className="flex-col items-start gap-1 py-2"
                  >
                    <span className="font-medium">{title}</span>
                    <span className="line-clamp-2 text-muted-foreground text-xs">
                      {getPlainText(result.excerpt)}
                    </span>
                  </CommandItem>
                )
              })
            )}
          </CommandList>
        </Command>
        <div className="absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t bg-muted/50 px-4 font-medium text-muted-foreground text-xs">
          <kbd className="pointer-events-none flex h-5 items-center justify-center rounded border bg-background px-1 text-[0.7rem] [&_svg]:size-3">
            <CornerDownLeftIcon />
          </kbd>
          {footerText}
        </div>
      </CommandDialog>
    </>
  )
}
