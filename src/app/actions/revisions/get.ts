'use server'

import { createClient } from '@/utils/supabase/server'

export interface PostRevision {
    id: string
    post_id: string
    content: any
    title: string
    excerpt: string | null
    author_id: string
    created_at: string
    author: {
        full_name: string | null
        email: string | null
    } | null
}

export async function getPostRevisions(postId: string): Promise<PostRevision[]> {
    try {
        const supabase = await createClient()

        // Note: 'post_revisions' might not be generated in types yet if migration hasn't run
        // Casting to any to avoid build errors until types are updated
        const { data, error } = await (supabase
            .from('post_revisions') as any)
            .select(`
        *,
        author:profiles(full_name, email)
      `)
            .eq('post_id', postId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) {
            console.warn('Error fetching revisions (table might not exist yet):', error)
            return []
        }

        return (data || []).map((rev: any) => ({
            ...rev,
            author: rev.author
        }))
    } catch (error) {
        console.error('Failed to fetch revisions:', error)
        return []
    }
}
