'use client'

import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { generateText } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: any
  className?: string
}

/**
 * Extracts headings from Tiptap JSON content and generates TOC
 */
function extractHeadings(content: any): TOCItem[] {
  if (!content || !content.content) return []

  const headings: TOCItem[] = []

  function traverse(node: any) {
    if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
      const text = node.content
        ?.map((child: any) => {
          if (child.type === 'text') return child.text
          return ''
        })
        .join('') || ''

      if (text) {
        // Generate slug from heading text
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        // Deduplicate IDs
        let uniqueId = id
        let counter = 1
        while (headings.some(h => h.id === uniqueId)) {
          uniqueId = `${id}-${counter}`
          counter++
        }

        headings.push({
          id: uniqueId,
          text,
          level: node.attrs.level,
        })
      }
    }

    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse)
    }
  }

  traverse(content)
  return headings
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  // Derive headings directly with memoization
  const headings = useMemo(() => extractHeadings(content), [content])

  useEffect(() => {
    // Add IDs to actual headings in the document after render
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (!element) {
        // Find heading by text content (fallback if ID wasn't set)
        const allHeadings = Array.from(document.querySelectorAll('h2, h3'))
        const headingEl = allHeadings.find(
          (h) => h.textContent?.trim() === heading.text
        )
        if (headingEl) {
          headingEl.id = heading.id
        }
      }
    })

    // Track active heading on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -70% 0px',
      }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav
      className={cn(
        'bg-card border border-border rounded-lg p-6 sticky top-24',
        className
      )}
      aria-label="Table of contents"
    >
      <h3 className="font-heading font-bold text-lg mb-4">Contents</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(heading.id)
                if (element) {
                  const offset = 100 // Account for sticky header
                  const elementPosition = element.getBoundingClientRect().top
                  const offsetPosition = elementPosition + window.scrollY - offset

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                  })

                  // Update URL without scrolling
                  window.history.pushState(null, '', `#${heading.id}`)
                }
              }}
              className={cn(
                'block py-1 transition-colors hover:text-accent',
                heading.level === 3 && 'pl-4',
                activeId === heading.id
                  ? 'text-accent font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
