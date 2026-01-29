import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!supabaseUrl,
        length: supabaseUrl?.length || 0,
        preview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'not set',
        startsWith: supabaseUrl?.startsWith('http') || false,
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!supabaseKey,
        length: supabaseKey?.length || 0,
        preview: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'not set',
        startsWith: supabaseKey?.startsWith('eyJ') || false,
      },
    },
    nodeEnv: process.env.NODE_ENV,
    allNextPublicVars: Object.keys(process.env)
      .filter(key => key.startsWith('NEXT_PUBLIC_'))
      .map(key => ({
        key,
        exists: !!process.env[key],
        length: process.env[key]?.length || 0,
      })),
  })
}
