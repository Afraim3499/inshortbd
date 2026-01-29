'use server'

import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { getSiteUrl } from '@/lib/env'

export async function requestReview(postId: string): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: 'Only admins and editors can request review' }
    }

    const typedProfile = profile as { role: 'admin' | 'editor' | 'reader'; full_name: string | null }
    if (!['admin', 'editor'].includes(typedProfile.role)) {
      return { success: false, error: 'Only admins and editors can request review' }
    }

    // Update post status to 'review'
    const { error: updateError } = await (supabase
      .from('posts') as any)
      .update({ status: 'review' })
      .eq('id', postId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Get post details
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
      // Send notification email to author (optional)
      const siteUrl = getSiteUrl()
      const reviewUrl = `${siteUrl}/admin/editor?id=${postId}`

      await sendEmail({
        to: typedPost.profiles.email,
        subject: `Review Requested: ${typedPost.title}`,
        html: `
          <h2>Review Requested</h2>
          <p>Your article "${typedPost.title}" has been submitted for review.</p>
          <p><a href="${reviewUrl}">View Article</a></p>
        `,
      }).catch((err) => {
        console.error('Error sending review request email:', err)
        // Don't fail the operation if email fails
      })
    }

    // Get assigned reviewers and send notifications
    // Note: post_assignments table may not be in generated Database types
    const { data: assignments } = await (supabase
      .from('post_assignments') as any)
      .select('assigned_to, profiles(email, full_name)')
      .eq('post_id', postId)

    if (assignments) {
      await Promise.all(
        assignments.map(async (assignment: any) => {
          const assignedProfile = assignment.profiles as any
          if (assignedProfile?.email) {
            const siteUrl = getSiteUrl()
            const reviewUrl = `${siteUrl}/admin/editor?id=${postId}`

            await sendEmail({
              to: assignedProfile.email,
              subject: `Review Requested: ${typedPost?.title || 'Untitled Article'}`,
              html: `
                <h2>Review Requested</h2>
                <p>You have been assigned to review "${typedPost?.title || 'Untitled Article'}".</p>
                <p><a href="${reviewUrl}">Review Article</a></p>
              `,
            }).catch((err) => {
              console.error('Error sending assignment email:', err)
            })
          }
        })
      )
    }

    return { success: true }
  } catch (error) {
    console.error('Error requesting review:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





