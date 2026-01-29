'use server'

import { createClient } from '@/utils/supabase/server'

export interface Assignment {
  id: string
  post_id: string
  assigned_to: string
  assigned_by: string
  deadline: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  notes: string | null
  created_at: string
  updated_at: string
  posts: {
    id: string
    title: string
    slug: string
    status: string
  } | null
  assigned_to_profile: {
    full_name: string | null
    email: string | null
  } | null
  assigned_by_profile: {
    full_name: string | null
    email: string | null
  } | null
}

export async function getAssignments(filters?: {
  assigned_to?: string
  status?: string
  priority?: string
}): Promise<Assignment[]> {
  try {
    const supabase = await createClient()

    // Note: content_assignments table may not be in generated Database types
    let query = (supabase
      .from('post_assignments') as any)
      .select(
        `
        *,
        posts(id, title, slug, status),
        assigned_to_profile:profiles!post_assignments_assigned_to_fkey(full_name, email),
        assigned_by_profile:profiles!post_assignments_assigned_by_fkey(full_name, email)
      `
      )
      .order('deadline', { ascending: true })

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching assignments:', error)
      return []
    }

    return (data || []) as Assignment[]
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return []
  }
}

export async function getAssignmentByPost(postId: string): Promise<Assignment | null> {
  try {
    const supabase = await createClient()

    // Note: content_assignments table may not be in generated Database types
    const { data, error } = await (supabase
      .from('post_assignments') as any)
      .select(
        `
        *,
        posts(id, title, slug, status),
        assigned_to_profile:profiles!post_assignments_assigned_to_fkey(full_name, email),
        assigned_by_profile:profiles!post_assignments_assigned_by_fkey(full_name, email)
      `
      )
      .eq('post_id', postId)
      .single()

    if (error || !data) {
      return null
    }

    return data as Assignment
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return null
  }
}





