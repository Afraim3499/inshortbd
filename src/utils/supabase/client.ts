import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // During build or if env vars are missing, return a mock client
  if (!url || !key || url === '' || key === '') {
    const mockClient = {
      from: () => mockClient,
      select: () => mockClient,
      single: async () => ({ data: null, error: { code: 'PGRST116', message: 'No rows returned' } }),
      eq: () => mockClient,
      neq: () => mockClient,
      not: () => mockClient,
      gte: () => mockClient,
      lte: () => mockClient,
      contains: () => mockClient,
      order: () => mockClient,
      limit: () => mockClient,
      range: () => mockClient,
      in: () => mockClient,
      auth: { 
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
    } as any
    return mockClient
  }
  
  return createBrowserClient<Database>(url, key)
}

