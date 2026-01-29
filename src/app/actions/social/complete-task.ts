'use server'

import { createClient } from '@/utils/supabase/server'

export interface CompleteSocialTaskResult {
  success: boolean
  error?: string
}

export async function completeSocialTask(
  taskId: string,
  completionLink: string,
  completionNotes?: string
): Promise<CompleteSocialTaskResult> {
  try {
    if (!completionLink.trim()) {
      return {
        success: false,
        error: 'Completion link is required',
      }
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Verify task exists and is assigned to user
    // Note: social_tasks table may not be in generated Database types
    const { data: task, error: taskError } = await (supabase
      .from('social_tasks') as any)
      .select('id, assigned_to, status')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return {
        success: false,
        error: 'Task not found',
      }
    }

    // Check if user is assigned or is admin/editor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Type assertion for profile role
    const typedProfile = profile as { role: 'admin' | 'editor' | 'reader' } | null
    const isAdminOrEditor = typedProfile?.role === 'admin' || typedProfile?.role === 'editor'
    const isAssigned = task.assigned_to === user.id

    if (!isAssigned && !isAdminOrEditor) {
      return {
        success: false,
        error: 'You do not have permission to complete this task',
      }
    }

    // Create completion record
    // Note: social_task_completions table may not be in generated Database types
    const { error: completionError } = await (supabase
      .from('social_task_completions') as any)
      .insert({
        task_id: taskId,
        completed_by: user.id,
        completion_link: completionLink.trim(),
        completion_notes: completionNotes || null,
        verification_status: 'pending',
      })

    if (completionError) {
      console.error('Complete task error:', completionError)
      return {
        success: false,
        error: 'Failed to record completion. Please try again.',
      }
    }

    // Update task status to completed
    const { error: updateError } = await (supabase
      .from('social_tasks') as any)
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (updateError) {
      console.error('Update task status error:', updateError)
      // Don't fail if status update fails, completion is already recorded
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Complete social task error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete task',
    }
  }
}





