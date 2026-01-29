'use server'

import { createClient } from '@/utils/supabase/server'

export async function getPostCollections(postId: string): Promise<string[]> {
  try {
    const supabase = await createClient()

    // Note: collection_posts table may not be in generated Database types
    const { data, error } = await (supabase
      .from('collection_posts') as any)
      .select('collection_id')
      .eq('post_id', postId)

    if (error || !data) {
      return []
    }

    return data.map((item: any) => item.collection_id)
  } catch (error) {
    console.error('Error fetching post collections:', error)
    return []
  }
}





