'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function moderateComment(
  commentId: string,
  status: 'approved' | 'rejected' | 'spam'
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
      return { success: false, error: 'Only admins and editors can moderate comments' }
    }

    const typedProfile = profile as { role: 'admin' | 'editor' | 'reader' }
    if (!['admin', 'editor'].includes(typedProfile.role)) {
      return { success: false, error: 'Only admins and editors can moderate comments' }
    }

    // Get comment to find post_id for revalidation
    // Note: comments table may not be in generated Database types
    const { data: comment } = await (supabase
      .from('comments') as any)
      .select('post_id')
      .eq('id', commentId)
      .single()

    // Update comment status
    const { error } = await (supabase
      .from('comments') as any)
      .update({ status })
      .eq('id', commentId)

    if (error) {
      return { success: false, error: error.message }
    }

    if (comment?.post_id) {
      revalidatePath(`/news/${comment.post_id}`)
    }
    revalidatePath('/admin/comments')

    return { success: true }
  } catch (error) {
    console.error('Error moderating comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





