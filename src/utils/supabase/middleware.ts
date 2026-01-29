import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Middleware runs at edge - validate env vars exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
    // During development, log warning but don't block requests
    // This allows the app to run even if env vars aren't loaded yet
    if (process.env.NODE_ENV === 'development') {
      console.warn('Missing required Supabase environment variables in middleware - some features may not work')
      return response
    }
    // In production, return error
    console.error('Missing required Supabase environment variables in middleware')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: You *must* call getUser() in the middleware to refresh the
  // session token.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Admin Protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    // If no profile or not admin/editor, redirect to home or login
    const typedProfile = profile as { role: string } | null
    if (!typedProfile || (typedProfile.role !== 'admin' && typedProfile.role !== 'editor')) {
      // Redirect to home for now if they are logged in but not authorized
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

