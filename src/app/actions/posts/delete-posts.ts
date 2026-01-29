'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deletePosts(postIds: string[]) {
    const supabase = await createClient()

    // 1. Delete Analytics Events
    // Note: We ignore errors here because RLS might prevent viewing them, 
    // or they might not exist. If this fails due to strict RLS, 
    // the post delete will fail later anyway.
    const { error: analyticsError } = await supabase
        .from('analytics_events')
        .delete()
        .in('post_id', postIds)

    if (analyticsError) {
        console.error('Server Action: Validate Analytics Delete Error:', analyticsError)
        // If strict RLS blocks this, we can't proceed with post delete.
        // However, we proceed to try. 
    }

    // 2. Delete Comments
    const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('post_id', postIds)

    if (commentsError) {
        console.error('Server Action: Comment Delete Error:', commentsError)
    }

    // 3. Delete Posts
    const { data, error } = await supabase
        .from('posts')
        .delete()
        .in('id', postIds)

    if (error) {
        console.error('Server Action: Post Delete Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/desk')
    return { success: true }
}
