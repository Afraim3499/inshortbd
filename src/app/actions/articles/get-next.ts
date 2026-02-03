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
    try {
        const supabase = await createClient()
        let finalPosts: Post[] = []

        // 0. CHECK FOR COLLECTION / SERIES NEXT POST
        // ---------------------------------------------------------
        // Find if this post is in a collection
        const { data: collectionEntry } = await (supabase
            .from('collection_posts') as any)
            .select('collection_id, order_index')
            .eq('post_id', currentPostId)
            .maybeSingle()

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
                .eq('posts.status', 'published')
                .gt('order_index', collectionEntry.order_index)
                .order('order_index', { ascending: true })
                .limit(1)
                .single()

            if (nextCollectionPostData?.post) {
                finalPosts.push(nextCollectionPostData.post)
            }
        }

        // 1. Fetch Candidates (Category + Tags) for remaining slots
        // ---------------------------------------------------------
        const remainingLimit = limit - finalPosts.length
        if (remainingLimit > 0) {
            let query = (supabase.from('posts') as any)
                .select('*')
                .eq('status', 'published')
                .neq('id', currentPostId)
                .order('published_at', { ascending: false })
                .limit(remainingLimit * 3)

            // Exclude already added series post if any
            if (finalPosts.length > 0) {
                // Use explicit .not with array, which Supabase supports if mapped correctly
                const excludedIds = finalPosts.map(p => p.id)
                // Using filter string for robustness in 'in' clause if needed, but array is standard
                // We'll use the raw filter style ensuring it's valid: (id1,id2)
                const filterString = `(${excludedIds.join(',')})`
                query = query.not('id', 'in', filterString)
            }

            // Construct safer OR filter
            // Format: category.eq."Value",tags.cs.{tag1,tag2}
            // We must quote the value to handle spaces/specials: "Value"
            const safeCategory = `"${category.replace(/"/g, '\\"')}"`

            // For tags, we need Postgres array literal format: {tag1,tag2}
            // And double quote each element
            const safeTags = tags.length > 0
                ? `tags.cs.{${tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}`
                : null

            let orCondition = `category.eq.${safeCategory}`
            if (safeTags) {
                orCondition += `,${safeTags}`
            }

            query = query.or(orCondition)

            const { data: candidates, error: candidateError } = await query

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
                    if (post.published_at) {
                        const daysOld = (Date.now() - new Date(post.published_at).getTime()) / (1000 * 60 * 60 * 24)
                        if (daysOld < 7) score += 2
                    }
                    return { post, score }
                })

                scoredData.sort((a, b) => b.score - a.score)
                finalPosts = [...finalPosts, ...scoredData.map(d => d.post).slice(0, remainingLimit)]
            }
        }

        // 4. Fallback: If still under limit, fill with Latest
        // ---------------------------------------------------------
        if (finalPosts.length < limit) {
            const needed = limit - finalPosts.length
            const existingIds = [currentPostId, ...finalPosts.map(p => p.id)]

            // Use standard syntax for array exclusion
            // .in() supports array but .not() takes (column, operator, value) where value is string representation for list
            const filterString = `(${existingIds.join(',')})`

            const { data: fallback, error: fallbackError } = await (supabase
                .from('posts') as any)
                .select('*')
                .eq('status', 'published')
                .not('id', 'in', filterString)
                .order('published_at', { ascending: false })
                .limit(needed)

            if (!fallbackError && fallback) {
                finalPosts = [...finalPosts, ...(fallback as Post[])]
            }
        }

        return {
            posts: finalPosts,
            source: collectionEntry ? 'series' : (finalPosts.length > 0 ? 'mixed' : 'latest')
        }
    } catch (error) {
        console.error('Error in getNextArticles:', error)
        // Return clear empty result on crash to prevent Client Component error
        return {
            posts: [],
            source: 'latest'
        }
    }
}
