'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function createAssignment(data: {
  post_id: string
  assigned_to: string
  deadline: Date
  priority?: 'low' | 'medium' | 'high'
  notes?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
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
      return { success: false, error: 'Only admins and editors can create assignments' }
    }

    const typedProfile = profile as { role: 'admin' | 'editor' | 'reader' }
    if (!['admin', 'editor'].includes(typedProfile.role)) {
      return { success: false, error: 'Only admins and editors can create assignments' }
    }

    // Determine status based on deadline
    const now = new Date()
    const status = data.deadline < now ? 'overdue' : 'pending'

    // Insert assignment
    // Note: content_assignments table may not be in generated Database types
    const assignmentPayload = {
      post_id: data.post_id,
      assigned_to: data.assigned_to,
      assigned_by: user.id,
      deadline: data.deadline.toISOString(),
      status,
      priority: data.priority || 'medium',
      notes: data.notes || null,
    }
    const { data: assignment, error } = await (supabase
      .from('post_assignments') as any)
      .insert(assignmentPayload)
      .select()
      .single()

    if (error || !assignment) {
      return { success: false, error: error?.message || 'Failed to create assignment' }
    }

    revalidatePath('/admin/assignments')
    revalidatePath('/admin/editor')

    return { success: true, id: assignment.id }
  } catch (error) {
    console.error('Error creating assignment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





