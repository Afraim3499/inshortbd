/**
 * Campaign analytics utilities
 */

import { createClient } from '@/utils/supabase/server'

export interface CampaignMetrics {
  campaign: string
  sessions: number
  pageViews: number
  avgTimeOnPage: number
  avgScrollDepth: number
  topSource: string
  topMedium: string
  percentage: number
}

export async function getCampaignMetrics(
  startDate?: Date,
  endDate?: Date
): Promise<CampaignMetrics[]> {
  const supabase = await createClient()

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate || new Date()

  // Get sessions with campaigns
  const { data: sessions, error } = await (supabase
    .from('analytics_sessions') as any)
    .select('*, analytics_events(*)')
    .not('utm_campaign', 'is', null)
    .gte('started_at', start.toISOString())
    .lte('started_at', end.toISOString())

  if (error || !sessions) {
    return []
  }

  const typedSessions = (sessions || []) as any[]

  // Get events for time/scroll calculations
  const { data: events } = await (supabase
    .from('analytics_events') as any)
    .select('*')
    .in(
      'session_id',
      typedSessions.map((s: any) => s.session_id)
    )
    .gte('timestamp', start.toISOString())
    .lte('timestamp', end.toISOString())

  // Group by campaign
  const campaignMap = new Map<string, {
    sessions: any[]
    sourceCounts: Map<string, number>
    mediumCounts: Map<string, number>
  }>()

  typedSessions.forEach((session: any) => {
    if (!session.utm_campaign) return

    const campaignKey = session.utm_campaign
    let existing = campaignMap.get(campaignKey)
    if (!existing) {
      existing = {
        sessions: [] as any[],
        sourceCounts: new Map<string, number>(),
        mediumCounts: new Map<string, number>(),
      }
      campaignMap.set(campaignKey, existing)
    }

    existing.sessions.push(session)

    if (session.utm_source) {
      existing.sourceCounts.set(
        session.utm_source,
        (existing.sourceCounts.get(session.utm_source) || 0) + 1
      )
    }

    if (session.utm_medium) {
      existing.mediumCounts.set(
        session.utm_medium,
        (existing.mediumCounts.get(session.utm_medium) || 0) + 1
      )
    }
  })

  // Calculate metrics for each campaign
  const totalSessions = typedSessions.length
  const metrics: CampaignMetrics[] = []
  const typedEvents = (events || []) as any[]

  campaignMap.forEach((data, campaign) => {
    const campaignSessions = data.sessions
    const campaignSessionIds = campaignSessions.map((s: any) => s.session_id)

    // Calculate average time on page
    const timeEvents = typedEvents.filter(
      (e: any) =>
        e.event_type === 'time' &&
        campaignSessionIds.includes(e.session_id)
    )
    const avgTime = timeEvents.length > 0
      ? Math.round(
          timeEvents.reduce((sum: number, e: any) => sum + (e.event_data?.timeSeconds || 0), 0) /
            timeEvents.length
        )
      : 0

    // Calculate average scroll depth
    const scrollEvents = typedEvents.filter(
      (e: any) =>
        e.event_type === 'scroll' &&
        campaignSessionIds.includes(e.session_id)
    )
    const avgScroll = scrollEvents.length > 0
      ? Math.round(
          scrollEvents.reduce(
            (sum: number, e: any) => sum + (e.event_data?.scrollDepth || 0),
            0
          ) / scrollEvents.length
        )
      : 0

    // Find top source and medium
    const topSource = Array.from(data.sourceCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'unknown'
    const topMedium = Array.from(data.mediumCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'unknown'

    const pageViews = campaignSessions.reduce((sum: number, s: any) => sum + (s.page_views || 1), 0)

    metrics.push({
      campaign,
      sessions: campaignSessions.length,
      pageViews,
      avgTimeOnPage: avgTime,
      avgScrollDepth: avgScroll,
      topSource,
      topMedium,
      percentage: totalSessions > 0
        ? Math.round((campaignSessions.length / totalSessions) * 100)
        : 0,
    })
  })

  return metrics.sort((a, b) => b.sessions - a.sessions)
}





