'use server'

import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

export interface GetNextArticlesResult {
    posts: Post[]
    source: 'related' | 'latest' | 'mixed' | 'series'
}

// ... imports

export async function getNextArticles(
    currentPostId: string,
    category: string,
    tags: string[] = [],
    limit: number = 4
): Promise<GetNextArticlesResult> {
    const supabase = await createClient()
    let finalPosts: Post[] = []

    // 0. CHECK FOR COLLECTION / SERIES NEXT POST
    // ---------------------------------------------------------
    // Find if this post is in a collection
    const { data: collectionEntry } = await (supabase
        .from('collection_posts') as any)
        .select('collection_id, order_index')
        .eq('post_id', currentPostId)
        .maybeSingle() // Use maybeSingle to avoid 406 if not found

    if (collectionEntry) {
        // Find the NEXT post in this collection
        const { data: nextCollectionPostData } = await (supabase
            .from('collection_posts') as any)
            .select(`
                post:posts (
                    *
                )
            `)
            .eq('collection_id', collectionEntry.collection_id)
            .eq('posts.status', 'published') // Ensure published
            .gt('order_index', collectionEntry.order_index) // Next one
            .order('order_index', { ascending: true })
            .limit(1)
            .single()

        // If we found a next post in the series
        if (nextCollectionPostData?.post) {
            finalPosts.push(nextCollectionPostData.post)
            // Reduce limit for recommendation engine since we found one
            // But we actually want to KEEP limit=4 overall, so we just fill the rest.
        }
    }

    // 1. Fetch Candidates (Category + Tags) for remaining slots
    // ---------------------------------------------------------
    const remainingLimit = limit - finalPosts.length
    if (remainingLimit > 0) {
        const { data: candidates, error: candidateError } = await (supabase
            .from('posts') as any)
            .select('*')
            .eq('status', 'published')
            .neq('id', currentPostId)
            // Exclude already added series post if any
            .not('id', 'in', `(${finalPosts.map(p => p.id).join(',')})`)
            .or(`category.eq.${category},tags.cs.{${tags.join(',') || 'none'}}`)
            .order('published_at', { ascending: false })
            .limit(remainingLimit * 3)

        if (!candidateError && candidates) {
            const rawCandidates = candidates as Post[]

            // 2. Score Candidates
            const scoredData = rawCandidates.map(post => {
                let score = 0
                if (post.category === category) score += 5
                if (post.tags && tags.length > 0) {
                    const matchCount = post.tags.filter((t: string) => tags.includes(t)).length
                    score += matchCount * 3
                }
                // Boost recent posts
                if (post.published_at) {
                    const daysOld = (Date.now() - new Date(post.published_at).getTime()) / (1000 * 60 * 60 * 24)
                    if (daysOld < 7) score += 2
                }
                return { post, score }
            })

            // 3. Sort by Score
            scoredData.sort((a, b) => b.score - a.score)

            finalPosts = [...finalPosts, ...scoredData.map(d => d.post).slice(0, remainingLimit)]
        }
    }

    // 4. Fallback: If still under limit, fill with Latest
    // ---------------------------------------------------------
    if (finalPosts.length < limit) {
        const needed = limit - finalPosts.length
        const existingIds = [currentPostId, ...finalPosts.map(p => p.id)]

        const { data: fallback, error: fallbackError } = await (supabase
            .from('posts') as any)
            .select('*')
            .eq('status', 'published')
            .not('id', 'in', `(${existingIds.join(',')})`)
            .order('published_at', { ascending: false })
            .limit(needed)

        if (!fallbackError && fallback) {
            finalPosts = [...finalPosts, ...(fallback as Post[])]
        }
    }

    return {
        posts: finalPosts,
        source: collectionEntry ? 'series' : (finalPosts.length > 0 ? 'mixed' : 'latest')
        // Note: consumer might not care about 'series' specifically, but 'mixed' is fine.
        // Or we can add 'series' to the type if needed, but for now 'mixed' covers "not just random".
    }
}
