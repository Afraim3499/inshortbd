'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAssignment(
  assignmentId: string,
  data: {
    deadline?: Date
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
    priority?: 'low' | 'medium' | 'high'
    notes?: string
  }
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

    // Build update payload
    const updateData: any = {}

    if (data.deadline) {
      updateData.deadline = data.deadline.toISOString()

      // Update status based on deadline if not explicitly set
      if (!data.status) {
        const now = new Date()
        updateData.status = data.deadline < now ? 'overdue' : 'pending'
      }
    }

    if (data.status) {
      updateData.status = data.status
    }

    if (data.priority) {
      updateData.priority = data.priority
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes || null
    }

    // Update assignment
    const { error } = await (supabase
      .from('post_assignments') as any)
      .update(updateData)
      .eq('id', assignmentId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/assignments')
    revalidatePath('/admin/editor')

    return { success: true }
  } catch (error) {
    console.error('Error updating assignment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





