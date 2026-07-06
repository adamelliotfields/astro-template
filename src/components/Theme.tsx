'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type ThemeName = 'system' | 'light' | 'dark'

const themes: Array<{ name: ThemeName; icon: typeof Monitor }> = [
  { name: 'system', icon: Monitor },
  { name: 'light', icon: Sun },
  { name: 'dark', icon: Moon }
]

export default function Theme() {
  const [theme, setTheme] = useState<ThemeName>('system')

  useEffect(() => {
    const { documentElement } = window.document
    setTheme((documentElement.dataset.theme as ThemeName | undefined) ?? 'system')

    const observer = new MutationObserver(() => {
      setTheme((documentElement.dataset.theme as ThemeName | undefined) ?? 'system')
    })

    observer.observe(documentElement, { attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const handleClick = () => {
    const index = themes.findIndex((item) => item.name === theme)
    const nextTheme = themes[(index + 1) % themes.length]?.name ?? 'system'
    document.documentElement.dataset.theme = nextTheme
  }

  const ThemeIcon = themes.find((item) => item.name === theme)?.icon ?? Monitor

  return (
    <Button
      type="button"
      size="icon-lg"
      variant="ghost"
      onClick={handleClick}
      aria-label={`Change color theme. Current theme: ${theme}`}
      className="cursor-pointer rounded-full text-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <ThemeIcon width="1.125em" height="1.125em" strokeWidth={1.5} />
    </Button>
  )
}
