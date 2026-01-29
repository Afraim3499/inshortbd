'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Zap, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { SearchModal } from './search-modal'
import { MobileMenuModal } from './mobile-menu-modal'

export function MobileBottomNav() {
    const pathname = usePathname()
    const [searchOpen, setSearchOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const isActive = (path: string) => pathname === path

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-lg border-t border-card-border lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-4 h-full">
                    {/* Home */}
                    <Link
                        href="/"
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            isActive('/') ? "text-primary" : "text-gray-500 hover:text-gray-900"
                        )}
                        aria-label="হোম"
                    >
                        <Home className="w-6 h-6" strokeWidth={isActive('/') ? 2.5 : 2} />
                    </Link>

                    {/* Search */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
                        aria-label="অনুসন্ধান"
                    >
                        <Search className="w-6 h-6" strokeWidth={2} />
                    </button>

                    {/* Latest */}
                    <Link
                        href="/category/Politics"
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            isActive('/category/Politics') ? "text-primary" : "text-gray-500 hover:text-gray-900"
                        )}
                        aria-label="সর্বশেষ"
                    >
                        <Zap className="w-6 h-6" strokeWidth={isActive('/category/Politics') ? 2.5 : 2} />
                    </Link>

                    {/* Menu */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            menuOpen ? "text-primary" : "text-gray-500 hover:text-gray-900"
                        )}
                        aria-label="মেনু"
                    >
                        <Menu className="w-6 h-6" strokeWidth={menuOpen ? 2.5 : 2} />
                    </button>
                </div>
            </nav>

            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
            <MobileMenuModal open={menuOpen} onOpenChange={setMenuOpen} />
        </>
    )
}
