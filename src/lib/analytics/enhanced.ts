/**
 * Enhanced analytics data fetching
 */

import { createClient } from '@/utils/supabase/server'

export interface EnhancedAnalyticsData {
  // Engagement metrics
  averageTimeOnPage: number // seconds
  averageScrollDepth: number // percentage
  totalSessions: number
  totalEvents: number
  
  // Traffic sources
  trafficSources: {
    source: string
    count: number
    percentage: number
  }[]
  
  // Device breakdown
  deviceBreakdown: {
    deviceType: string
    count: number
    percentage: number
  }[]
  
  // Browser analytics
  browserBreakdown: {
    browser: string
    count: number
    percentage: number
  }[]
  
  // Geographic data
  topCountries: {
    country: string
    count: number
    percentage: number
  }[]
  
  // Time-based data (last 30 days)
  dailyViews: {
    date: string
    views: number
    sessions: number
  }[]
}

export async function getEnhancedAnalyticsData(
  startDate?: Date,
  endDate?: Date
): Promise<EnhancedAnalyticsData> {
  const supabase = await createClient()
  
  // Default to last 30 days if no dates provided
  const defaultStartDate = new Date()
  defaultStartDate.setDate(defaultStartDate.getDate() - 30)
  
  const start = startDate || defaultStartDate
  const end = endDate || new Date()

  // Get sessions with date filter
  const { data: sessions, error: sessionsError } = await (supabase
    .from('analytics_sessions') as any)
    .select('*')
    .gte('started_at', start.toISOString())
    .lte('started_at', end.toISOString())

  if (sessionsError || !sessions) {
    return getEmptyAnalyticsData()
  }

  // Get events with date filter
  const { data: events, error: eventsError } = await (supabase
    .from('analytics_events') as any)
    .select('*')
    .gte('timestamp', start.toISOString())
    .lte('timestamp', end.toISOString())

  if (eventsError) {
    console.error('Error fetching events:', eventsError)
  }

  // Calculate engagement metrics
  const timeEvents = (events || []).filter((e: any) => e.event_type === 'time')
  const scrollEvents = (events || []).filter((e: any) => e.event_type === 'scroll')
  
  const averageTimeOnPage = calculateAverageTimeOnPage(timeEvents)
  const averageScrollDepth = calculateAverageScrollDepth(scrollEvents)

  // Traffic sources
  const trafficSources = calculateTrafficSources(sessions)

  // Device breakdown
  const deviceBreakdown = calculateDeviceBreakdown(sessions)

  // Browser breakdown
  const browserBreakdown = calculateBrowserBreakdown(sessions)

  // Top countries
  const topCountries = calculateTopCountries(sessions)

  // Daily views (last 30 days)
  const dailyViews = calculateDailyViews(sessions, start, end)

  return {
    averageTimeOnPage,
    averageScrollDepth,
    totalSessions: sessions.length,
    totalEvents: events?.length || 0,
    trafficSources,
    deviceBreakdown,
    browserBreakdown,
    topCountries,
    dailyViews,
  }
}

function calculateAverageTimeOnPage(timeEvents: any[]): number {
  if (timeEvents.length === 0) return 0
  
  const times = timeEvents
    .map((e) => e.event_data?.timeSeconds || 0)
    .filter((t) => t > 0)
  
  if (times.length === 0) return 0
  
  const sum = times.reduce((acc, t) => acc + t, 0)
  return Math.round(sum / times.length)
}

function calculateAverageScrollDepth(scrollEvents: any[]): number {
  if (scrollEvents.length === 0) return 0
  
  const depths = scrollEvents
    .map((e) => e.event_data?.scrollDepth || 0)
    .filter((d) => d > 0)
  
  if (depths.length === 0) return 0
  
  const sum = depths.reduce((acc, d) => acc + d, 0)
  return Math.round(sum / depths.length)
}

function calculateTrafficSources(sessions: any[]): Array<{ source: string; count: number; percentage: number }> {
  const sourceMap = new Map<string, number>()
  
  sessions.forEach((session) => {
    const source = session.traffic_source || 'other'
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
  })
  
  const total = sessions.length
  
  return Array.from(sourceMap.entries())
    .map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

function calculateDeviceBreakdown(sessions: any[]): Array<{ deviceType: string; count: number; percentage: number }> {
  const deviceMap = new Map<string, number>()
  
  sessions.forEach((session) => {
    const device = session.device_type || 'unknown'
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
  })
  
  const total = sessions.length
  
  return Array.from(deviceMap.entries())
    .map(([deviceType, count]) => ({
      deviceType: deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

function calculateBrowserBreakdown(sessions: any[]): Array<{ browser: string; count: number; percentage: number }> {
  const browserMap = new Map<string, number>()
  
  sessions.forEach((session) => {
    const browser = session.browser || 'Unknown'
    browserMap.set(browser, (browserMap.get(browser) || 0) + 1)
  })
  
  const total = sessions.length
  
  return Array.from(browserMap.entries())
    .map(([browser, count]) => ({
      browser,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 browsers
}

function calculateTopCountries(sessions: any[]): Array<{ country: string; count: number; percentage: number }> {
  const countryMap = new Map<string, number>()
  
  sessions.forEach((session) => {
    const country = session.country || 'Unknown'
    countryMap.set(country, (countryMap.get(country) || 0) + 1)
  })
  
  const total = sessions.length
  
  return Array.from(countryMap.entries())
    .map(([country, count]) => ({
      country,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 countries
}

function calculateDailyViews(
  sessions: any[],
  startDate: Date,
  endDate: Date
): Array<{ date: string; views: number; sessions: number }> {
  const dailyMap = new Map<string, { views: number; sessions: number }>()
  
  // Initialize all dates in range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    dailyMap.set(dateStr, { views: 0, sessions: 0 })
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Aggregate sessions by date
  sessions.forEach((session) => {
    const dateStr = new Date(session.started_at).toISOString().split('T')[0]
    const existing = dailyMap.get(dateStr) || { views: 0, sessions: 0 }
    dailyMap.set(dateStr, {
      views: existing.views + (session.page_views || 1),
      sessions: existing.sessions + 1,
    })
  })
  
  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      views: data.views,
      sessions: data.sessions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function getEmptyAnalyticsData(): EnhancedAnalyticsData {
  return {
    averageTimeOnPage: 0,
    averageScrollDepth: 0,
    totalSessions: 0,
    totalEvents: 0,
    trafficSources: [],
    deviceBreakdown: [],
    browserBreakdown: [],
    topCountries: [],
    dailyViews: [],
  }
}





