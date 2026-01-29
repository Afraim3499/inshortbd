'use server'

import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/lib/env'

export interface CreateSocialTaskResult {
  success: boolean
  taskId?: string
  error?: string
}

export interface CreateSocialTaskInput {
  postId: string
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'other'
  taskTitle: string
  taskDescription?: string
  postText?: string
  assignedTo?: string
  dueDate?: Date
  scheduledDate?: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export async function createSocialTask(
  input: CreateSocialTaskInput
): Promise<CreateSocialTaskResult> {
  try {
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

    // Get article URL
    const siteUrl = getSiteUrl()
    const { data: post } = await supabase
      .from('posts')
      .select('slug')
      .eq('id', input.postId)
      .single()

    // Type assertion for post query result
    const typedPost = post as { slug: string } | null
    const articleUrl = typedPost ? `${siteUrl}/news/${typedPost.slug}` : null

    // Create task
    // Note: social_tasks table may not be in generated Database types
    const { data: task, error } = await (supabase
      .from('social_tasks') as any)
      .insert({
        post_id: input.postId,
        platform: input.platform,
        task_title: input.taskTitle,
        task_description: input.taskDescription || null,
        post_text: input.postText || null,
        article_url: articleUrl,
        assigned_to: input.assignedTo || null,
        assigned_by: user.id,
        due_date: input.dueDate?.toISOString() || null,
        scheduled_date: input.scheduledDate?.toISOString() || null,
        priority: input.priority || 'medium',
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Create social task error:', error)
      return {
        success: false,
        error: 'Failed to create task. Please try again.',
      }
    }

    return {
      success: true,
      taskId: task.id,
    }
  } catch (error) {
    console.error('Create social task error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    }
  }
}





