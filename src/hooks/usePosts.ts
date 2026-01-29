import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

export function usePosts() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('posts') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as Post[]
    },
  })
}





