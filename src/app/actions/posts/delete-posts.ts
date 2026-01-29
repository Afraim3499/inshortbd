'use server'

// Use Admin Client to bypass RLS for deletion
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deletePosts(postIds: string[]) {
    // We use the Admin Client (Service Role) because:
    // 1. Regular users might not have RLS permission to delete 'analytics_events' rows.
    // 2. We need to guarantee these rows are gone before deleting the post to avoid Foreign Key errors.
    const supabase = createAdminClient()

    // 1. Delete Analytics Events (Strict Cleanup)
    const { error: analyticsError } = await supabase
        .from('analytics_events')
        .delete()
        .in('post_id', postIds)

    if (analyticsError) {
        console.error('Server Action: Cleanup Failed (Analytics):', analyticsError)
        throw new Error(`Failed to cleanup analytics: ${analyticsError.message}`)
    }

    // 2. Delete Comments (Strict Cleanup)
    const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('post_id', postIds)

    if (commentsError) {
        console.error('Server Action: Cleanup Failed (Comments):', commentsError)
        throw new Error(`Failed to cleanup comments: ${commentsError.message}`)
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
