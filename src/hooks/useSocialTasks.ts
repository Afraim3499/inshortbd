'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'

type SocialTask = Database['public']['Tables']['social_tasks']['Row']
type SocialTaskCompletion = Database['public']['Tables']['social_task_completions']['Row']

interface SocialTaskWithDetails extends SocialTask {
  post?: {
    id: string
    title: string
    slug: string
  } | null
  assigned_to_profile?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  assigned_by_profile?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  completions?: SocialTaskCompletion[]
}

interface UseSocialTasksOptions {
  assignedTo?: string
  status?: string
  platform?: string
  limit?: number
}

export function useSocialTasks(options: UseSocialTasksOptions = {}) {
  const supabase = createClient()
  const { assignedTo, status, platform, limit } = options

  return useQuery({
    queryKey: ['social-tasks', assignedTo, status, platform],
    queryFn: async () => {
      let query = (supabase
        .from('social_tasks') as any)
        .select(`
          *,
          post:posts(id, title, slug),
          assigned_to_profile:profiles!social_tasks_assigned_to_fkey(id, full_name, email),
          assigned_by_profile:profiles!social_tasks_assigned_by_fkey(id, full_name, email),
          completions:social_task_completions(*)
        `)
        .order('created_at', { ascending: false })

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (platform) {
        query = query.eq('platform', platform)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      return (data as SocialTaskWithDetails[]) || []
    },
  })
}

export function useSocialTaskKPI(userId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['social-task-kpi', userId],
    queryFn: async () => {
      let tasksQuery = (supabase
        .from('social_tasks') as any)
        .select('id, status, assigned_to, platform, created_at, due_date')

      if (userId) {
        tasksQuery = tasksQuery.eq('assigned_to', userId)
      }

      const { data: tasks, error: tasksError } = await tasksQuery

      if (tasksError) throw tasksError

      // Get completions
      let completionsQuery = (supabase
        .from('social_task_completions') as any)
        .select('id, task_id, completed_by, completed_at, verification_status')

      if (userId) {
        completionsQuery = completionsQuery.eq('completed_by', userId)
      }

      const { data: completions, error: completionsError } = await completionsQuery

      if (completionsError) throw completionsError

      // Calculate KPIs
      const typedTasks = (tasks || []) as any[]
      const totalTasks = typedTasks.length
      const completedTasks = typedTasks.filter((t: any) => t.status === 'completed').length
      const pendingTasks = typedTasks.filter((t: any) => t.status === 'pending').length
      const inProgressTasks = typedTasks.filter((t: any) => t.status === 'in_progress').length

      // Calculate completion rate
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      // Calculate average completion time
      let avgCompletionTime: number | null = null
      const typedCompletions = (completions || []) as any[]
      if (typedCompletions.length > 0) {
        const completionTimes: number[] = []

        for (const completion of typedCompletions) {
          const task = typedTasks.find((t: any) => t.id === completion.task_id)
          if (task && completion.completed_at) {
            const created = new Date(task.created_at).getTime()
            const completed = new Date(completion.completed_at).getTime()
            const hours = (completed - created) / (1000 * 60 * 60)
            completionTimes.push(hours)
          }
        }

        if (completionTimes.length > 0) {
          avgCompletionTime =
            Math.round(
              (completionTimes.reduce((a: number, b: number) => a + b, 0) / completionTimes.length) * 10
            ) / 10
        }
      }

      // Platform breakdown
      const platformBreakdown = typedTasks.reduce((acc: Record<string, { total: number; completed: number }>, task: any) => {
        if (!acc[task.platform]) {
          acc[task.platform] = { total: 0, completed: 0 }
        }
        acc[task.platform].total++
        if (task.status === 'completed') {
          acc[task.platform].completed++
        }
        return acc
      }, {} as Record<string, { total: number; completed: number }>)

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionRate,
        avgCompletionTime,
        platformBreakdown: platformBreakdown || {},
      }
    },
  })
}





