'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/constants'
import { useMemo } from 'react'

export interface Category {
    name: string
    target: number
}

export function useCategories() {
    const supabase = createClient()

    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('content_goals')
                .select('category, target_count')
                .order('category')

            if (error) {
                console.error('Error fetching categories:', error)
                throw error
            }

            // If DB is empty, return defaults mapped to shape
            if (!data || data.length === 0) {
                return DEFAULT_CATEGORIES.map(cat => ({
                    name: cat,
                    target: 10 // Default target if not in DB
                }))
            }

            return data.map((row: any) => ({
                name: row.category,
                target: row.target_count
            }))
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    })

    // Fallback to defaults if loading or error (optional, but keeps UI stable)
    const displayCategories = useMemo(() => {
        return categories.length > 0 ? categories : DEFAULT_CATEGORIES.map(cat => ({ name: cat, target: 10 }))
    }, [categories])

    return {
        categories: displayCategories,
        names: displayCategories.map((c: Category) => c.name),
        isLoading,
        error
    }
}
