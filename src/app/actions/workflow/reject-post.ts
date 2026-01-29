'use server'

import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { getSiteUrl } from '@/lib/env'

export async function rejectPost(
  postId: string,
  comment: string
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || profileError || !('role' in profile)) {
      return { success: false, error: 'Only admins and editors can reject posts' }
    }

    const typedProfile = profile as { role: 'admin' | 'editor' | 'reader'; full_name: string | null }
    if (!['admin', 'editor'].includes(typedProfile.role)) {
      return { success: false, error: 'Only admins and editors can reject posts' }
    }

    if (!comment || comment.trim().length === 0) {
      return { success: false, error: 'Rejection comment is required' }
    }

    // Update post status back to 'draft'
    const { error: updateError } = await (supabase
      .from('posts') as any)
      .update({ status: 'draft' })
      .eq('id', postId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Add rejection comment
    // Note: post_comments table may not be in generated Database types
    await (supabase.from('post_comments') as any).insert({
      post_id: postId,
      user_id: user.id,
      content: `**Rejected:** ${comment}`,
    })

    // Get post details for notification
    const { data: post } = await supabase
      .from('posts')
      .select('id, title, author_id, profiles(full_name, email)')
      .eq('id', postId)
      .single()

    // Type assertion for post query result
    const typedPost = post as {
      id: string
      title: string
      author_id: string | null
      profiles: { full_name: string | null; email: string | null } | null
    } | null

    if (typedPost && typedPost.profiles?.email) {
      // Send notification email to author
      const siteUrl = getSiteUrl()
      const editorUrl = `${siteUrl}/admin/editor?id=${postId}`

      await sendEmail({
        to: typedPost.profiles.email,
        subject: `Article Needs Revisions: ${typedPost.title}`,
        html: `
          <h2>Article Needs Revisions</h2>
          <p>Your article "${typedPost.title}" has been returned for revisions.</p>
          <p><strong>Feedback:</strong></p>
          <p>${comment}</p>
          <p><a href="${editorUrl}">Edit Article</a></p>
        `,
      }).catch((err) => {
        console.error('Error sending rejection email:', err)
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error rejecting post:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





