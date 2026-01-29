import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      postId,
      deviceType,
      browser,
      browserVersion,
      os,
      osVersion,
      country,
      city,
      referrer,
      trafficSource,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body

    if (!sessionId || !postId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user ID if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if session already exists
    const { data: existingSession } = await (supabase
      .from('analytics_sessions') as any)
      .select('id, page_views')
      .eq('session_id', sessionId)
      .single()

    if (existingSession) {
      // Update existing session - increment page_views
      const currentPageViews = (existingSession as any).page_views || 0
      const { error } = await (supabase
        .from('analytics_sessions') as any)
        .update({
          page_views: currentPageViews + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId)

      if (error) {
        console.error('Error updating session:', error)
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
      }

      return NextResponse.json({ success: true, sessionId: existingSession.id })
    }

    // Create new session
    const { data, error } = await (supabase
      .from('analytics_sessions') as any)
      .insert({
        session_id: sessionId,
        post_id: postId,
        user_id: user?.id || null,
        device_type: deviceType || 'unknown',
        browser: browser || null,
        browser_version: browserVersion || null,
        os: os || null,
        os_version: osVersion || null,
        country: country || null,
        city: city || null,
        referrer: referrer || null,
        traffic_source: trafficSource || 'other',
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        page_views: 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({ success: true, sessionId: data.id })
  } catch (error) {
    console.error('Error in analytics session API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}





