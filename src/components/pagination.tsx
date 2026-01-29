'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string | string[] | undefined>
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  const searchParamsObject = useSearchParams()

  // Build URL with search params preserved
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()

    // Preserve existing search params
    searchParamsObject?.forEach((value, key) => {
      if (key !== 'page') {
        params.set(key, value)
      }
    })

    // Also preserve passed searchParams
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        params.set(key, Array.isArray(value) ? value[0] : value)
      }
    })

    // Add page number
    if (page > 1) {
      params.set('page', page.toString())
    }

    const queryString = params.toString()
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`
  }

  if (totalPages <= 1) return null

  // Calculate page range to show
  const getPageNumbers = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const pages: (number | string)[] = []

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (
        pages[pages.length - 1] !== '...'
      ) {
        pages.push('...')
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Pagination navigation"
      role="navigation"
    >
      {/* Previous Button */}
      <Link
        href={buildUrl(currentPage - 1)}
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm font-medium transition-colors',
          currentPage === 1
            ? 'opacity-50 cursor-not-allowed pointer-events-none'
            : 'hover:bg-accent/10 hover:border-accent hover:text-accent'
        )}
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">পূর্ববর্তী</span>
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-muted-foreground"
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Link
              key={pageNum}
              href={buildUrl(pageNum)}
              className={cn(
                'min-w-[2.5rem] px-3 py-2 rounded-md border text-sm font-medium text-center transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'border-border hover:bg-accent/10 hover:border-accent hover:text-accent'
              )}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      <Link
        href={buildUrl(currentPage + 1)}
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-md border border-border text-sm font-medium transition-colors',
          currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed pointer-events-none'
            : 'hover:bg-accent/10 hover:border-accent hover:text-accent'
        )}
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
      >
        <span className="hidden sm:inline">পরবর্তী</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  )
}

