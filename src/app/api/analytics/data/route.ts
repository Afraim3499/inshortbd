import { NextRequest, NextResponse } from 'next/server'
import { getEnhancedAnalyticsData } from '@/lib/analytics/enhanced'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')

    const startDate = startParam ? new Date(startParam) : undefined
    const endDate = endParam ? new Date(endParam) : undefined

    const data = await getEnhancedAnalyticsData(startDate, endDate)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching enhanced analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}






