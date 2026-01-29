'use client'

import { Calendar } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

export function FilterBar() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get current values
    const currentSort = searchParams.get('sort') || 'latest'
    const currentCategory = searchParams.get('category') || 'সব বিভাগ'
    const currentTimeRange = searchParams.get('timeRange') || 'সব সময়'
    const currentDate = searchParams.get('date') || ''

    // Helper to update URL
    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value && value !== 'সব বিভাগ' && value !== 'সব সময়') {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // Reset page when filtering
        params.delete('page')

        router.push(`/?${params.toString()}`)
    }, [router, searchParams])

    return (
        <div className="bg-soft-wash border-b border-card-border sticky top-16 z-30 hidden md:block">
            <div className="max-w-[1400px] mx-auto px-6 py-3">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-ink-black font-sans">ফিল্টার:</span>

                    {/* Date Picker */}
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-white border rounded-lg transition-colors group",
                        currentDate ? "border-primary ring-1 ring-primary" : "border-gray-300 hover:border-primary"
                    )}>
                        <Calendar className={cn("w-4 h-4", currentDate ? "text-primary" : "text-gray-500")} />
                        <label htmlFor="date-filter" className="sr-only">তারিখ নির্বাচন করুন</label>
                        <input
                            id="date-filter"
                            name="date"
                            type="date"
                            className="text-sm border-none focus:outline-none cursor-pointer text-gray-700 font-mono bg-transparent"
                            value={currentDate}
                            onChange={(e) => updateFilter('date', e.target.value)}
                        />
                    </div>

                    {/* Sort Options */}
                    {[
                        { label: 'সাম্প্রতিক', value: 'latest' },
                        { label: 'জনপ্রিয়', value: 'popular' },
                        { label: 'আলোচিত', value: 'trending' },
                        { label: '🔥 টপ', value: 'hot' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateFilter('sort', option.value)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg font-sans transition-colors",
                                currentSort === option.value
                                    ? "bg-primary text-white shadow-sm hover:bg-blue-700"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}

                    {/* Category Filter */}
                    <label htmlFor="category-filter" className="sr-only">ক্যাটাগরি বাছাই করুন</label>
                    <select
                        id="category-filter"
                        name="category"
                        value={currentCategory}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className={cn(
                            "px-4 py-2 bg-white border text-sm rounded-lg cursor-pointer text-gray-700 font-sans focus:outline-none",
                            currentCategory !== 'সব বিভাগ' ? "border-primary ring-1 ring-primary" : "border-gray-300 hover:border-primary"
                        )}
                    >
                        <option>সব বিভাগ</option>
                        <option>রাজনীতি</option>
                        <option>প্রযুক্তি</option>
                        <option>সংস্কৃতি</option>
                        <option>ব্যবসা</option>
                        <option>বিশ্ব</option>
                    </select>

                    {/* Time Range */}
                    <label htmlFor="time-range-filter" className="sr-only">সময়সীমা বাছাই করুন</label>
                    <select
                        id="time-range-filter"
                        name="timeRange"
                        value={currentTimeRange}
                        onChange={(e) => updateFilter('timeRange', e.target.value)}
                        className={cn(
                            "px-4 py-2 bg-white border text-sm rounded-lg cursor-pointer text-gray-700 font-sans focus:outline-none",
                            currentTimeRange !== 'সব সময়' ? "border-primary ring-1 ring-primary" : "border-gray-300 hover:border-primary"
                        )}
                    >
                        <option>সব সময়</option>
                        <option>গত ২৪ ঘণ্টা</option>
                        <option>এই সপ্তাহ</option>
                        <option>এই মাস</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
