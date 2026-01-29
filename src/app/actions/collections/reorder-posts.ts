'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface ReorderItem {
    post_id: string
    new_index: number
}

export async function reorderCollectionPosts(
    collectionId: string,
    items: ReorderItem[]
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()

        // Get current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Check permissions
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const typedProfile = profile as { role: 'admin' | 'editor' | 'reader' } | null
        if (!typedProfile || !['admin', 'editor'].includes(typedProfile.role)) {
            return { success: false, error: 'Not authorized' }
        }

        // Perform updates
        // We update each item's order_index
        // This could be optimized with a stored procedure or batch update if Supabase supported it easily via JS client,
        // but a loop of upserts is acceptable for small list sizes (collections typically < 50 items).

        const updates = items.map(item => ({
            collection_id: collectionId,
            post_id: item.post_id,
            order_index: item.new_index
        }))

        const { error } = await (supabase
            .from('collection_posts') as any)
            .upsert(updates, { onConflict: 'collection_id,post_id' })

        if (error) {
            console.error('Supabase reorder error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/collections')
        revalidatePath('/collections')

        return { success: true }
    } catch (error) {
        console.error('Error reordering collection:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
