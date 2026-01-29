'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function SkipToContent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show on Tab key press
      if (e.key === 'Tab' && !isVisible) {
        setIsVisible(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible])

  const handleClick = () => {
    const main = document.querySelector('main')
    if (main) {
      main.focus()
      main.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsVisible(false)
    }
  }

  if (!isVisible) return null

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault()
        handleClick()
      }}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4',
        'focus:z-[100] focus:px-4 focus:py-2',
        'focus:bg-accent focus:text-accent-foreground',
        'focus:rounded-md focus:font-medium',
        'focus:shadow-lg focus:outline-none',
        'transition-all duration-200'
      )}
    >
      Skip to main content
    </a>
  )
}

