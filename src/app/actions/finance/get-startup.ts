'use server'

import { createClient } from '@/utils/supabase/server'
import type { StartupStoryExtended } from '@/types/finance.types'

export async function getStartupBySlug(slug: string, type: 'success' | 'failure'): Promise<StartupStoryExtended | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('startup_stories')
        .select('*')
        .eq('slug', slug)
        .eq('story_type', type)
        .single()

    if (error) {
        console.error('Error fetching startup story:', error)
        return null
    }

    return data as unknown as StartupStoryExtended
}

export async function getRelatedStartups(type: 'success' | 'failure', excludeId: string, limit = 3): Promise<StartupStoryExtended[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('startup_stories')
        .select('*')
        .eq('story_type', type)
        .neq('id', excludeId)
        .limit(limit)

    if (error) {
        return []
    }

    return data as unknown as StartupStoryExtended[]
}

export async function getStartups(filters?: {
    type?: 'success' | 'failure'
    limit?: number
    offset?: number
}): Promise<{ stories: StartupStoryExtended[]; total: number }> {
    const supabase = await createClient()

    let query = supabase
        .from('startup_stories')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false })

    if (filters?.type) {
        query = query.eq('story_type', filters.type)
    }

    if (filters?.limit) {
        query = query.limit(filters.limit)
    }

    if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching startups:', error)
        return { stories: [], total: 0 }
    }

    return {
        stories: (data || []) as unknown as StartupStoryExtended[],
        total: count || 0,
    }
}
