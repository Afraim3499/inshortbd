import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'

type SiteConfig = Database['public']['Tables']['site_config']['Row']

export function useSiteConfig() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['site_config'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('site_config') as any)
        .select('*')
        .single()

      if (error) {
        // If no config exists, create one
        if (error.code === 'PGRST116') {
          const { data: newConfig, error: insertError } = await (supabase
            .from('site_config') as any)
            .insert({})
            .select()
            .single()

          if (insertError) throw insertError
          return newConfig as SiteConfig
        }
        throw error
      }
      return data as SiteConfig
    },
  })
}

export function useUpdateSiteConfig() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<SiteConfig>) => {
      // Get current config
      const { data: current } = await (supabase
        .from('site_config') as any)
        .select('*')
        .single()

      if (!current) {
        // Create if doesn't exist
        const { data, error } = await (supabase
          .from('site_config') as any)
          .insert(updates)
          .select()
          .single()

        if (error) throw error
        return data as SiteConfig
      } else {
        // Update existing
        const typedCurrent = current as any
        const { data, error } = await (supabase
          .from('site_config') as any)
          .update(updates)
          .eq('id', typedCurrent.id)
          .select()
          .single()

        if (error) throw error
        return data as SiteConfig
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_config'] })
    },
  })
}





