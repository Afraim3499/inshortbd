'use server'

import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { getSiteUrl } from '@/lib/env'

export async function assignReviewer(
  postId: string,
  assignedTo: string,
  role: 'reviewer' | 'editor' | 'approver' = 'reviewer'
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
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profileError || !('role' in profile)) {
      return { success: false, error: 'Only admins and editors can assign reviewers' }
    }

    const typedProfile = profile as { role: 'admin' | 'editor' | 'reader' }
    if (!['admin', 'editor'].includes(typedProfile.role)) {
      return { success: false, error: 'Only admins and editors can assign reviewers' }
    }

    // Insert or update assignment
    // Note: post_assignments table may not be in generated Database types
    const { error: assignmentError } = await (supabase
      .from('post_assignments') as any)
      .upsert(
        {
          post_id: postId,
          assigned_to: assignedTo,
          assigned_by: user.id,
          role,
        },
        {
          onConflict: 'post_id,assigned_to',
        }
      )

    if (assignmentError) {
      return { success: false, error: assignmentError.message }
    }

    // Get post and assignee details for notification
    const { data: post } = await supabase
      .from('posts')
      .select('id, title')
      .eq('id', postId)
      .single()

    // Type assertion for post query result
    const typedPost = post as { id: string; title: string } | null

    const { data: assignee } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', assignedTo)
      .single()

    // Type assertion for assignee query result
    const typedAssignee = assignee as { email: string; full_name: string | null } | null

    if (typedAssignee?.email) {
      // Send notification email
      const siteUrl = getSiteUrl()
      const editorUrl = `${siteUrl}/admin/editor?id=${postId}`

      await sendEmail({
        to: typedAssignee.email,
        subject: `Assigned to Review: ${typedPost?.title || 'Untitled Article'}`,
        html: `
          <h2>Review Assignment</h2>
          <p>You have been assigned as a ${role} for "${typedPost?.title || 'Untitled Article'}".</p>
          <p><a href="${editorUrl}">Review Article</a></p>
        `,
      }).catch((err) => {
        console.error('Error sending assignment email:', err)
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error assigning reviewer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





