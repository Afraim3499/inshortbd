import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

export function useTags() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('posts') as any)
        .select('tags')
        .not('tags', 'is', null)
        .eq('status', 'published')

      if (error) throw error

      // Flatten and deduplicate tags
      const allTags = new Set<string>()
      const typedData = (data || []) as any[]
      typedData.forEach((post: any) => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag: any) => allTags.add(tag))
        }
      })

      return Array.from(allTags).sort()
    },
  })
}





