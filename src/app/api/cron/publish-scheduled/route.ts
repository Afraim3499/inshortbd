import { NextRequest, NextResponse } from 'next/server'
import { publishScheduledPosts } from '@/app/actions/publish-scheduled'

/**
 * API route for cron jobs to auto-publish scheduled posts
 * Protected with a secret token (required in production)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // In production, require authentication
  // In development, allow if CRON_SECRET is not set
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret) {
      console.error('CRON_SECRET not configured in production')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else {
    // Development: warn if no secret but allow
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const result = await publishScheduledPosts()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to publish scheduled posts' },
      { status: 500 }
    )
  }
}

