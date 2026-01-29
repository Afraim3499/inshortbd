'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { useHasMounted } from '@/hooks/use-has-mounted'

const CATEGORIES = ['Politics', 'Tech', 'Culture', 'Business', 'World']

// Bangla display names for categories
const CATEGORY_NAMES: Record<string, string> = {
  'Politics': 'রাজনীতি',
  'Tech': 'প্রযুক্তি',
  'Culture': 'সংস্কৃতি',
  'Business': 'ব্যবসা-বাণিজ্য',
  'World': 'বিশ্ব',
}

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const hasMounted = useHasMounted()

  // Load recent searches from localStorage with lazy initialization to avoid Effect
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Search Index State
  const [searchIndex, setSearchIndex] = useState<any[]>([])
  const [loadingIndex, setLoadingIndex] = useState(false)

  // Initialize client-side data (only load localStorage, not mount state)
  // NOTE: This is a legitimate client-side initialization pattern for localStorage
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = localStorage.getItem('inshort_recent_searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5))
      } catch {
        // Invalid JSON
      }
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Fetch Search Index when modal opens
  // NOTE: This is a legitimate external data sync pattern - fetching on modal open
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open && searchIndex.length === 0 && !loadingIndex) {
      setLoadingIndex(true)
      fetch('/api/search-index')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSearchIndex(data)
          }
        })
        .catch(err => console.error("Failed to load search index", err))
        .finally(() => setLoadingIndex(false))
    }
  }, [open, searchIndex.length, loadingIndex])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Fuse Instance
  const fuse = useMemo(() => new Fuse(searchIndex, {
    keys: ['title', 'excerpt', 'category', 'tags'],
    threshold: 0.3,
    ignoreLocation: true
  }), [searchIndex])

  // Perform Search - Derived State (No Side Effect)
  const results = useMemo(() => {
    if (!query.trim()) return []
    const searchResults = fuse.search(query)
    return searchResults.map(r => r.item).slice(0, 5)
  }, [query, fuse])


  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // Clear query after close animation
      const timer = setTimeout(() => setQuery(''), 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveRecentSearch(query.trim())
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      onOpenChange(false)
    }
  }

  const saveRecentSearch = (term: string) => {
    const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(newRecent)
    if (typeof window !== 'undefined') {
      localStorage.setItem('inshort_recent_searches', JSON.stringify(newRecent))
    }
  }

  const handleRecentClick = (search: string) => {
    setQuery(search)
    // router.push(`/search?q=${encodeURIComponent(search)}`) // UX: Just populate, let them see results? Or go?
    // Let's populate and search instantly
  }

  const handleCategoryClick = (category: string) => {
    router.push(`/category/${encodeURIComponent(category)}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-white">
        <DialogTitle className="sr-only">অনুসন্ধান করুন</DialogTitle>
        <div className="p-6 border-b border-card-border">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-meta-gray" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="নিবন্ধ, বিষয় বা বিভাগ অনুসন্ধান করুন..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-24 h-14 text-lg font-serif border-2 border-card-border focus:border-primary rounded-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {loadingIndex && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-card-border bg-soft-wash px-2 font-mono text-xs text-meta-gray">
                  {hasMounted && window.navigator?.platform?.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl'}K
                </kbd>
                <span className="text-xs text-meta-gray font-mono">ESC</span>
              </div>
            </div>
          </form>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Instant Results */}
          {query.trim() && (
            <div className="p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((post) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.slug}`}
                      onClick={() => {
                        saveRecentSearch(query)
                        onOpenChange(false)
                      }}
                      className="block p-4 hover:bg-soft-wash rounded-md transition-colors group"
                    >
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary mb-1">
                        {post.title}
                      </h4>
                      {post.category && (
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {post.category}
                        </span>
                      )}
                    </Link>
                  ))}
                  <button
                    onClick={handleSubmit}
                    className="w-full text-center py-4 text-sm font-medium text-primary hover:underline"
                  >
                    &quot;{query}&quot;-এর সকল ফলাফল দেখুন
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  &quot;{query}&quot;-এর সাথে মেলে এমন কোনো ফলাফল পাওয়া যায়নি
                </div>
              )}
            </div>
          )}

          {/* Default View (Recent + Categories) - Only show if no query */}
          {!query.trim() && (
            <>
              {recentSearches.length > 0 && (
                <div className="p-6 border-b border-card-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-meta-gray" />
                    <h3 className="text-sm font-sans font-semibold uppercase tracking-wide text-ink-black">
                      সাম্প্রতিক অনুসন্ধান
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(search)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-text hover:bg-soft-wash hover:text-primary transition-colors font-serif rounded-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-meta-gray" />
                  <h3 className="text-sm font-sans font-semibold uppercase tracking-wide text-ink-black">
                    বিভাগসমূহ দেখুন
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className="px-4 py-2 text-sm text-slate-text hover:bg-primary hover:text-white transition-colors font-serif border border-card-border hover:border-primary text-center"
                    >
                      {CATEGORY_NAMES[category] || category}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Search Tips */}
          <div className="p-6 bg-soft-wash border-t border-card-border">
            <DialogDescription className="text-xs text-meta-gray font-mono">
              অনুসন্ধান করতে <kbd className="px-1.5 py-0.5 rounded border border-card-border bg-white">Enter</kbd> চাপুন
              {' • '}
              বন্ধ করতে <kbd className="px-1.5 py-0.5 rounded border border-card-border bg-white">ESC</kbd> চাপুন
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
