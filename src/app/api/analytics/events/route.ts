import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, postId, eventType, eventData } = body

    if (!sessionId || !postId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert analytics event
    const { error } = await (supabase.from('analytics_events') as any).insert({
      session_id: sessionId,
      post_id: postId,
      event_type: eventType,
      event_data: eventData || {},
    })

    if (error) {
      console.error('Error inserting analytics event:', error)
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in analytics events API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}





