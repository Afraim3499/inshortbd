'use server'

import { createClient } from '@/utils/supabase/server'

export interface PostAssignment {
  id: string
  post_id: string
  assigned_to: string
  assigned_by: string
  role: 'reviewer' | 'editor' | 'approver'
  created_at: string
  assigned_to_profile: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  assigned_by_profile: {
    id: string
    full_name: string | null
  } | null
}

export async function getPostAssignments(postId: string): Promise<PostAssignment[]> {
  try {
    const supabase = await createClient()

    // Note: post_assignments table may not be in generated Database types
    const { data: assignments, error } = await (supabase
      .from('post_assignments') as any)
      .select(
        `
        *,
        assigned_to_profile:profiles!post_assignments_assigned_to_fkey(id, full_name, email),
        assigned_by_profile:profiles!post_assignments_assigned_by_fkey(id, full_name)
      `
      )
      .eq('post_id', postId)

    if (error || !assignments) {
      return []
    }

    return assignments.map((assignment: any) => ({
      ...assignment,
      assigned_to_profile: assignment.assigned_to_profile,
      assigned_by_profile: assignment.assigned_by_profile,
    }))
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return []
  }
}





