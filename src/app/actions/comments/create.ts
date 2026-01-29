'use server'

import { createClient } from '@/utils/supabase/server'
import { sanitizeHtml } from '@/lib/sanitize'
import { revalidatePath } from 'next/cache'

export async function createComment(
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
      return { success: false, error: 'You must be logged in to comment' }
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Comment cannot be empty' }
    }

    if (content.length > 5000) {
      return { success: false, error: 'Comment is too long (max 5000 characters)' }
    }

    // Sanitize HTML
    const sanitizedContent = sanitizeHtml(content.trim())

    // Insert comment (status defaults to 'pending' for moderation)
    // Note: comments table may not be in generated Database types
    const { data: comment, error } = await (supabase
      .from('comments') as any)
      .insert({
        post_id: postId,
        user_id: user.id,
        content: sanitizedContent,
        parent_id: parentId || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !comment) {
      return { success: false, error: error?.message || 'Failed to create comment' }
    }

    revalidatePath(`/news/${postId}`)

    return { success: true, commentId: comment.id }
  } catch (error) {
    console.error('Error creating comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





