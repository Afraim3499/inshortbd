import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // URL Normalization for SEO
  // 1. Enforce lowercase URLs (except for query params)
  const lowercasePath = pathname.toLowerCase()
  if (pathname !== lowercasePath && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    const url = new URL(request.url)
    url.pathname = lowercasePath
    return NextResponse.redirect(url, 301)
  }

  const response = await updateSession(request)

  // Security Headers
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Content Security Policy (Basic)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://apis.google.com https://news.google.com https://connect.facebook.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://news.google.com;
    img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://i.gr-assets.com https://www.google.com https://*.googleusercontent.com https://www.googletagmanager.com https://www.facebook.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://news.google.com https://www.facebook.com https://*.facebook.com;
    frame-src 'self' https://accounts.google.com https://news.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css)$).*)',
  ],
}






