'use server'

import { createClient } from '@/utils/supabase/server'

export interface Comment {
  id: string
  post_id: string
  user_id: string | null
  content: string
  parent_id: string | null
  status: 'pending' | 'approved' | 'rejected' | 'spam'
  created_at: string
  updated_at: string
  profiles: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
  replies?: Comment[]
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const supabase = await createClient()

    // Get approved comments only (for public display)
    // Note: comments table may not be in generated Database types
    const { data: comments, error } = await (supabase
      .from('comments') as any)
      .select(
        `
        *,
        profiles(full_name, email, avatar_url)
      `
      )
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error || !comments) {
      return []
    }

    // Organize comments into threaded structure
    const commentsMap = new Map<string, Comment>()
    const rootComments: Comment[] = []

    // First pass: create map of all comments
    comments.forEach((comment: any) => {
      commentsMap.set(comment.id, {
        ...comment,
        profiles: comment.profiles,
        replies: [],
      })
    })

    // Second pass: build tree structure
    comments.forEach((comment: any) => {
      const commentNode = commentsMap.get(comment.id)!
      if (comment.parent_id) {
        const parent = commentsMap.get(comment.parent_id)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(commentNode)
        }
      } else {
        rootComments.push(commentNode)
      }
    })

    return rootComments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}





