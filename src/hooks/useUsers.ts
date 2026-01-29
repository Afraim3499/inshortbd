'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useUsers() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('profiles') as any)
        .select('id, email, full_name, role')
        .in('role', ['admin', 'editor'])
        .order('full_name', { ascending: true })

      if (error) throw error
      return (data || []) as Profile[]
    },
  })
}





