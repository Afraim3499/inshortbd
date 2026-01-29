'use server'

import { createClient } from '@/utils/supabase/server'
import { getResendClient, sendEmail } from '@/lib/email/resend'
import { getSiteUrl } from '@/lib/env'

export async function sendDeadlineReminders(): Promise<{
  success: boolean
  sent: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const resend = getResendClient()

    if (!resend) {
      return { success: false, sent: 0, error: 'Email service not configured' }
    }

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Get assignments with deadlines in the next 24 hours or next 7 days
    // Note: content_assignments table may not be in generated Database types
    const { data: assignments, error } = await (supabase
      .from('post_assignments') as any)
      .select(
        `
        *,
        posts(id, title, slug),
        assigned_to_profile:profiles!content_assignments_assigned_to_fkey(email, full_name)
      `
      )
      .in('status', ['pending', 'in_progress'])
      .gte('deadline', now.toISOString())
      .lte('deadline', nextWeek.toISOString())

    if (error || !assignments) {
      return { success: false, sent: 0, error: error?.message || 'Failed to fetch assignments' }
    }

    let sentCount = 0

    // Define assignment type
    type Assignment = {
      id: string
      post_id: string
      assigned_to: string
      assigned_by: string
      deadline: string
      status: string
      priority?: string
      notes?: string | null
      posts?: { id: string; title: string; slug: string } | null
      assigned_to_profile?: { email: string; full_name: string | null } | null
    }

    // Group assignments by user
    const assignmentsByUser = new Map<string, Assignment[]>()

    assignments.forEach((assignment: any) => {
      if (assignment.assigned_to_profile?.email) {
        const email = assignment.assigned_to_profile.email
        if (!assignmentsByUser.has(email)) {
          assignmentsByUser.set(email, [])
        }
        assignmentsByUser.get(email)!.push(assignment as Assignment)
      }
    })

    // Send emails
    const siteUrl = getSiteUrl()

    for (const [email, userAssignments] of assignmentsByUser.entries()) {
      const deadlineDate = new Date(userAssignments[0].deadline)
      const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      const assignmentsList = userAssignments
        .map((a) => {
          const days = Math.ceil(
            (new Date(a.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
          return `- ${a.posts?.title || 'Unknown Article'} (Due in ${days} ${days === 1 ? 'day' : 'days'})`
        })
        .join('\n')

      const subject =
        daysUntil <= 1
          ? `⚠️ Assignment Deadline Approaching - ${userAssignments.length} ${userAssignments.length === 1 ? 'article' : 'articles'}`
          : `📅 Upcoming Assignment Deadlines - ${userAssignments.length} ${userAssignments.length === 1 ? 'article' : 'articles'}`

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>You have ${userAssignments.length} assignment${userAssignments.length === 1 ? '' : 's'} with upcoming deadline${userAssignments.length === 1 ? '' : 's'}:</p>
          <ul>
            ${userAssignments
          .map((a) => {
            const days = Math.ceil(
              (new Date(a.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )
            return `<li><strong>${a.posts?.title || 'Unknown Article'}</strong> - Due in ${days} ${days === 1 ? 'day' : 'days'}</li>`
          })
          .join('')}
          </ul>
          <p>
            <a href="${siteUrl}/admin/assignments" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Assignments
            </a>
          </p>
        </div>
      `

      try {
        await sendEmail({
          to: email,
          subject,
          html,
          from: 'Inshort <notifications@inshortbd.com>',
        })
        sentCount++
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError)
      }
    }

    return { success: true, sent: sentCount }
  } catch (error) {
    console.error('Error sending deadline reminders:', error)
    return {
      success: false,
      sent: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





