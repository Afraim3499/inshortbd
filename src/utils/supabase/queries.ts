import { SupabaseClient } from '@supabase/supabase-js'

export type FilterOptions = {
    category?: string
    date?: string
    timeRange?: string // '24h', 'week', 'month', 'year'
    sort?: string // 'latest', 'popular', 'trending', 'hot'
}

export const POSTS_PER_PAGE = 20

export function buildPostQuery(
    supabase: SupabaseClient,
    filters: FilterOptions = {},
    excludeIds: string[] = []
) {
    let query = supabase
        .from('posts')
        .select('id, title, slug, excerpt, category, published_at, featured_image_url, views', { count: 'exact' })
        .eq('status', 'published')

    // 1. Filter by Category
    if (filters.category && filters.category !== 'All Categories') {
        query = query.ilike('category', filters.category)
    }

    // 2. Filter by Specific Date
    if (filters.date) {
        // Supabase stores as timestamptz. We need to match the range for that day.
        const startOfDay = new Date(filters.date).toISOString()
        const endOfDay = new Date(new Date(filters.date).setHours(23, 59, 59, 999)).toISOString()

        query = query.gte('published_at', startOfDay).lte('published_at', endOfDay)
    }

    // 3. Filter by Time Range (if no specific date is selected)
    if (!filters.date && filters.timeRange) {
        const now = new Date()
        let timeAgo = new Date()

        switch (filters.timeRange) {
            case 'Last 24 Hours':
                timeAgo.setHours(now.getHours() - 24)
                break
            case 'This Week':
                timeAgo.setDate(now.getDate() - 7)
                break
            case 'This Month':
                timeAgo.setMonth(now.getMonth() - 1)
                break
            case 'All Time':
                // No filter needed
                timeAgo = new Date(0)
                break
            default:
                // Default to no filter if unknown
                timeAgo = new Date(0)
        }

        if (filters.timeRange !== 'All Time') {
            query = query.gte('published_at', timeAgo.toISOString())
        }
    }

    // 4. Exclude IDs
    if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    // 5. Sorting
    switch (filters.sort) {
        case 'popular':
        case 'hot': // Using 'views' for hot/popular for now
            query = query
                .not('views', 'is', null) // Ensure views exist
                .order('views', { ascending: false, nullsFirst: false })
                .order('published_at', { ascending: false }) // Secondary sort
            break
        case 'trending':
            // Trending is complex to calculate in SQL efficiently without a dedicated score column.
            // For now, we will approximate trending as "High Views in Last 7 Days".
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            query = query
                .gte('published_at', sevenDaysAgo.toISOString())
                .order('views', { ascending: false, nullsFirst: false })
            break
        case 'latest':
        default:
            query = query.order('published_at', { ascending: false })
            break
    }

    return query
}
