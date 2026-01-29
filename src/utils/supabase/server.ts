import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'
import { getEnv } from '@/lib/env'

export async function createClient() {
  const env = getEnv()

  // If env vars are empty (build-time static generation), return a mock client
  // This allows the build to continue, but queries will return empty results
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      env.NEXT_PUBLIC_SUPABASE_URL === '' || env.NEXT_PUBLIC_SUPABASE_ANON_KEY === '') {
    // Build-time fallback: return a no-op client
    const mockClient = {
      from: () => mockClient,
      select: () => mockClient,
      insert: () => ({ 
        select: () => Promise.resolve({ data: null, error: { message: 'Mock client: insert not available' } })
      }),
      update: () => ({ 
        eq: () => Promise.resolve({ data: null, error: { message: 'Mock client: update not available' } })
      }),
      delete: () => ({ 
        eq: () => Promise.resolve({ data: null, error: { message: 'Mock client: delete not available' } })
      }),
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
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as any
    return mockClient
  }

  // Try to get cookies, but handle build-time (generateStaticParams, etc.)
  let cookieStore
  try {
    cookieStore = await cookies()
  } catch (error) {
    // Build-time: cookies() not available (e.g., in generateStaticParams)
    // If env vars are empty, return mock client (don't call createServerClient with empty values)
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        env.NEXT_PUBLIC_SUPABASE_URL === '' || env.NEXT_PUBLIC_SUPABASE_ANON_KEY === '') {
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
        auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      } as any
      return mockClient
    }
    // Return a client without cookie handling (only if we have valid env vars)
    return createServerClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // No-op during build
          },
        },
      }
    )
  }

  // Normal request-time client with cookies
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
