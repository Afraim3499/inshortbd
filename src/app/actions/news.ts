'use server'

import { createClient } from '@/utils/supabase/server'

import { buildPostQuery, FilterOptions, POSTS_PER_PAGE } from '@/utils/supabase/queries'

export async function loadMorePosts(
    page: number,
    filters: FilterOptions = {},
    excludeIds: string[] = []
) {
    const supabase = await createClient()
    const from = (page - 1) * POSTS_PER_PAGE
    const to = from + POSTS_PER_PAGE - 1

    const query = buildPostQuery(supabase, filters, excludeIds)

    const { data, error } = await query.range(from, to)

    if (error) {
        console.error('Error fetching more posts:', error)
        return []
    }

    return (data || []) as any[]
}
