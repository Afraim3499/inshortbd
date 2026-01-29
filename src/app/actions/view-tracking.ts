'use server'

import { createClient } from '@/utils/supabase/server'

export async function incrementViewCount(postId: string) {
  try {
    const supabase = await createClient()
    
    // Get current views and increment
    const { data: post } = await supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single()
    
    // Type assertion for post query result
    const typedPost = post as { views: number | null } | null
    if (typedPost) {
      const newViews = (typedPost.views || 0) + 1
      await (supabase
        .from('posts') as any)
        .update({ views: newViews })
        .eq('id', postId)
    }
  } catch (error) {
    // Silently fail - don't block page load
    console.error('Failed to increment view count:', error)
  }
}

