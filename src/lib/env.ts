/**
 * Environment variable validation and utilities
 * Validates required environment variables at startup
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'CRON_SECRET',
  'RESEND_API_KEY',
] as const

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  NEXT_PUBLIC_SITE_URL?: string
  CRON_SECRET?: string
  RESEND_API_KEY?: string
}

function validateEnv(): EnvConfig {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar] === '') {
      missing.push(envVar)
    }
  }

  // Debug logging for production troubleshooting
  if (process.env.NODE_ENV === 'production') {
    console.log('--- ENV CHECK ---')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING')
    console.log('Current NODE_ENV:', process.env.NODE_ENV)
    console.log('Current PORT:', process.env.PORT)
    console.log('--- ENV CHECK END ---')
  }

  // During build time or development, Next.js may not have access to .env.local immediately
  // Allow empty values during build/dev - the mock client will handle it gracefully
  // Only throw errors in production runtime when env vars are truly required
  if (missing.length > 0) {
    // Check if we're in build context or development
    // During `next build`, PORT is not set
    // During `next dev`, we're in development mode
    const isBuildContext = !process.env.PORT
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isBuildContext || isDevelopment) {
      // Build/dev phase: return empty values, will use mock client
      // In dev, env vars should load eventually, but don't crash the app
      return {
        NEXT_PUBLIC_SUPABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        CRON_SECRET: process.env.CRON_SECRET,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
      }
    }

    // Production runtime (PORT is set and NODE_ENV is production): throw error
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file or environment configuration.'
    )
  }

  // Return validated environment variables
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    CRON_SECRET: process.env.CRON_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  }
}

// Validate on module load (server-side only)
let envConfig: EnvConfig | null = null

export function getEnv(): EnvConfig {
  if (!envConfig) {
    // Only validate on server-side
    if (typeof window === 'undefined') {
      envConfig = validateEnv()
    } else {
      // Client-side: return what's available (public vars only)
      envConfig = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      } as EnvConfig
    }
  }
  return envConfig
}

export function getSiteUrl(): string {
  return getEnv().NEXT_PUBLIC_SITE_URL || 'https://inshortbd.com'
}

