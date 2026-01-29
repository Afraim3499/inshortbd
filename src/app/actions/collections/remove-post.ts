'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function removePostFromCollection(
  collectionId: string,
  postId: string
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

    // Check if user is admin or editor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profileError || !('role' in profile)) {
      return { success: false, error: 'Only admins and editors can manage collections' }
    }

    const typedProfile = profile as { role: 'admin' | 'editor' | 'reader' }
    if (!['admin', 'editor'].includes(typedProfile.role)) {
      return { success: false, error: 'Only admins and editors can manage collections' }
    }

    // Delete collection_post
    // Note: collection_posts table may not be in generated Database types
    const { error } = await (supabase
      .from('collection_posts') as any)
      .delete()
      .eq('collection_id', collectionId)
      .eq('post_id', postId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/collections')
    revalidatePath('/collections')

    return { success: true }
  } catch (error) {
    console.error('Error removing post from collection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





