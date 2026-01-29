'use server'

import { createClient } from '@/utils/supabase/server'

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
  profiles: {
    full_name: string | null
    email: string | null
  } | null
  replies?: PostComment[]
}

export async function getPostComments(postId: string): Promise<PostComment[]> {
  try {
    const supabase = await createClient()

    // Get all comments for the post
    // Note: post_comments table may not be in generated Database types
    const { data: comments, error } = await (supabase
      .from('post_comments') as any)
      .select(
        `
        *,
        profiles(full_name, email)
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error || !comments) {
      return []
    }

    // Organize comments into threaded structure
    const commentsMap = new Map<string, PostComment>()
    const rootComments: PostComment[] = []

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





