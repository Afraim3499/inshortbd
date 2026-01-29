'use server'

import { createClient } from '@/utils/supabase/server'

export async function addComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<{ success: boolean; commentId?: string; error?: string }> {
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

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Comment cannot be empty' }
    }

    // Insert comment
    // Note: post_comments table may not be in generated Database types
    const { data: comment, error: insertError } = await (supabase
      .from('post_comments') as any)
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
      })
      .select()
      .single()

    if (insertError || !comment) {
      return { success: false, error: insertError?.message || 'Failed to add comment' }
    }

    return { success: true, commentId: comment.id }
  } catch (error) {
    console.error('Error adding comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





