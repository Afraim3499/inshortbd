'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  postId: string
  postSlug: string
  postTitle: string
  className?: string
  variant?: 'icon' | 'button'
}

export function BookmarkButton({
  postId,
  postSlug,
  postTitle,
  className,
  variant = 'icon',
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const bookmarks = JSON.parse(localStorage.getItem('inshort_bookmarks') || '[]')
      setTimeout(() => setIsBookmarked(bookmarks.some((b: any) => b.id === postId)), 0)
    } catch {
      setTimeout(() => setIsBookmarked(false), 0)
    }
  }, [postId])

  const toggleBookmark = () => {
    if (typeof window === 'undefined') return

    try {
      const bookmarks = JSON.parse(localStorage.getItem('inshort_bookmarks') || '[]')

      if (isBookmarked) {
        // Remove bookmark
        const updated = bookmarks.filter((b: any) => b.id !== postId)
        localStorage.setItem('inshort_bookmarks', JSON.stringify(updated))
        setIsBookmarked(false)
      } else {
        // Add bookmark
        const bookmark = {
          id: postId,
          slug: postSlug,
          title: postTitle,
          bookmarkedAt: new Date().toISOString(),
        }
        const updated = [...bookmarks, bookmark]
        localStorage.setItem('inshort_bookmarks', JSON.stringify(updated))
        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleBookmark}
        className={cn(
          'p-2 rounded-md hover:bg-accent/10 active:scale-95 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background',
          className
        )}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
        aria-pressed={isBookmarked}
        type="button"
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-5 h-5 text-accent" />
        ) : (
          <Bookmark className="w-5 h-5" />
        )}
      </button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleBookmark}
      className={className}
      aria-pressed={isBookmarked}
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="w-4 h-4 mr-2" />
          Bookmarked
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4 mr-2" />
          Bookmark
        </>
      )}
    </Button>
  )
}

