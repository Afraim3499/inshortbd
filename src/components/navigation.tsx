'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchModal } from './search-modal'

import { useCategories } from '@/hooks/use-categories'

// Finance is a special dashboard page, so we keep it separate or mixed in? 
// For now, we'll append it or handle it in the component.
const STATIC_NAV_ITEMS = [
  { name: 'ফাইন্যান্স', href: '/finance' },
]

interface NavigationProps {
  breakingBannerActive?: boolean
}

export function Navigation({ breakingBannerActive = false }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const { names: categoryNames } = useCategories()

  // Combine dynamic categories with static items (like Finance)
  // We filter out any dynamic category that might duplicate a static one (case insensitive)
  const navItems = [
    ...categoryNames.map((name: string) => ({ name, href: `/category/${encodeURIComponent(name)}` })),
    ...STATIC_NAV_ITEMS.filter((staticItem: { name: string }) => !categoryNames.some((c: string) => c.toLowerCase() === staticItem.name.toLowerCase()))
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  // Hydration handling: We usage suppressHydrationWarning on the date element
  // instead of a state change that causes a re-render.
  const today = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <header
        className={cn(
          "border-b border-card-border z-40 bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-200 relative lg:sticky lg:top-0"
        )}
      >
        {/* Top Row: Logo + Date + Search */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
              translate="no"
              aria-label="Inshort Homepage"
            >
              <Image
                src="/inshort-logo.svg"
                alt="Inshort"
                width={200}
                height={40}
                priority
                className="w-auto h-12"
              />
            </Link>

            {/* Desktop Date - Centered */}
            <div className="hidden lg:flex items-center">
              <div
                suppressHydrationWarning
                className="px-6 py-2.5 bg-soft-wash/50 border border-card-border/50 rounded-md font-mono text-sm text-ink-black font-semibold min-w-[200px] text-center"
              >
                {today}
              </div>
            </div>

            {/* Right Side: Search + Mobile Menu */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-lg hover:bg-soft-wash border border-transparent hover:border-card-border transition-all duration-200"
                aria-label="Search articles"
                title="Search (Cmd/Ctrl + K)"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-soft-wash border border-transparent hover:border-card-border transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Row: Category Navigation (Desktop) - Horizontal Button Bar */}
          <nav
            className="hidden lg:flex items-center justify-between border-t border-card-border py-3"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Categories as Horizontal Button Row */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'nav-category-button whitespace-nowrap',
                    isActive(item.href)
                    && 'bg-primary text-white border-primary shadow-md scale-105'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* About & Contact as Buttons */}
            <div className="flex items-center gap-3 border-l border-card-border pl-6 shrink-0">
              <Link
                href="/about"
                className={cn(
                  'nav-link-button',
                  isActive('/about') && 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                )}
              >
                সম্পর্কে
              </Link>
              <Link
                href="/contact"
                className={cn(
                  'nav-link-button',
                  isActive('/contact') && 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                )}
              >
                যোগাযোগ
              </Link>
            </div>
          </nav>

          {/* Mobile Date */}
          <div className="lg:hidden py-3 border-t border-card-border">
            <div
              className="px-4 py-2 bg-soft-wash/50 border border-card-border/50 rounded-md font-mono text-xs text-ink-black font-semibold inline-block"
            >
              {today}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={cn(
            'lg:hidden border-t border-card-border bg-white overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <nav className="px-4 py-6">
            {/* Categories Section - Horizontal Button Row */}
            <div className="mb-6">
              <div className="text-xs font-mono text-meta-gray uppercase tracking-wider mb-4 px-2 font-semibold">
                বিভাগসমূহ
              </div>
              <div className="flex flex-wrap gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'nav-category-button min-w-0',
                      isActive(item.href) && 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-card-border my-4" />

            {/* Additional Links - Horizontal */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'nav-link-button',
                  isActive('/about') && 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                )}
              >
                সম্পর্কে
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'nav-link-button',
                  isActive('/contact') && 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                )}
              >
                যোগাযোগ
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
