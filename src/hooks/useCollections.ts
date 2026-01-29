import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

type Collection = {
  id: string
  title: string
  slug: string
  description: string | null
  featured_image_url: string | null
  created_by: string
  created_at: string
  updated_at: string
  posts_count?: number
}

export function useCollections() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('collections') as any)
        .select('*, collection_posts(count)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map((collection: any) => ({
        ...collection,
        posts_count: collection.collection_posts?.[0]?.count || 0,
      })) as Collection[]
    },
  })
}





