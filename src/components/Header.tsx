'use client'

import { useEffect, useState } from 'react'

import Search from '@/components/Search'
import Theme from '@/components/Theme'
import { cn, trimTrailingSlash, withBase } from '@/lib/utils'

type HeaderBrand = {
  name: string
  suffix?: string
}

type HeaderNavPage = {
  description: string
  href: string
  title: string
}

type HeaderNavPost = {
  href: string
  title: string
}

type HeaderProps = {
  brand: HeaderBrand
  pages: HeaderNavPage[]
  posts: HeaderNavPost[]
}

export default function Header({ brand, pages, posts }: HeaderProps) {
  const [pathname, setPathname] = useState('')
  const [visible, setVisible] = useState(true)
  const links = pages.filter((page) => page.href !== '/')

  useEffect(() => {
    const href = trimTrailingSlash(window.location.pathname) || '/'
    setPathname(href)
  }, [])

  useEffect(() => {
    let previousY = window.scrollY

    const updateVisibility = () => {
      const currentY = window.scrollY
      setVisible(currentY < 16 || currentY < previousY)
      previousY = currentY
    }

    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-20 bg-background transition-transform duration-200 print:hidden',
        visible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <nav className="mx-auto grid h-full max-w-3xl grid-cols-[auto_1fr_auto] items-center border-b px-6 sm:flex sm:justify-between lg:px-0">
        <a href={withBase('/')} className="font-bold text-base text-foreground tracking-tighter">
          {brand.name}
          {brand.suffix ? <span className="text-muted-foreground">{brand.suffix}</span> : null}
        </a>
        <ul className="flex items-center gap-6 justify-self-center text-sm sm:ml-auto">
          {links.map((link) => {
            const href = withBase(link.href)
            const activeHref = href || '/'
            const isActive =
              pathname === activeHref ||
              (activeHref !== '/' && pathname.startsWith(`${activeHref}/`))
            return (
              <li key={link.href}>
                <a
                  href={href}
                  className={
                    isActive
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground transition-colors hover:text-foreground'
                  }
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.title}
                </a>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center gap-2 justify-self-end sm:ml-6">
          <Search pages={pages} posts={posts} />
          <Theme />
        </div>
      </nav>
    </header>
  )
}
