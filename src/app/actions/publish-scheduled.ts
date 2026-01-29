'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Auto-publishes scheduled posts whose published_at time has passed
 * This should be called periodically (e.g., via cron job or on admin page load)
 */
export async function publishScheduledPosts() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Find all draft posts with published_at in the past
  const { data: scheduledPosts, error: fetchError } = await supabase
    .from('posts')
    .select('id, title, published_at')
    .eq('status', 'draft')
    .not('published_at', 'is', null)
    .lte('published_at', now)

  if (fetchError) {
    return { success: false, error: fetchError.message, published: 0 }
  }

  if (!scheduledPosts || scheduledPosts.length === 0) {
    return { success: true, published: 0, message: 'No posts to publish' }
  }

  // Update all scheduled posts to published
  const postIds = scheduledPosts.map((post: any) => post.id)
  const { error: updateError } = await (supabase
    .from('posts') as any)
    .update({ status: 'published' })
    .in('id', postIds)

  if (updateError) {
    return { success: false, error: updateError.message, published: 0 }
  }

  return {
    success: true,
    published: scheduledPosts.length,
    posts: scheduledPosts.map((p: any) => ({ id: p.id, title: p.title })),
  }
}





