import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  try {
    const { error } = await (supabase.from('posts') as any).select('id').limit(1).single()

    if (error) {
      return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 503 })
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (e: any) {
    return NextResponse.json({ status: 'down', error: e.message }, { status: 500 })
  }
}
