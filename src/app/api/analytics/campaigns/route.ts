import { NextRequest, NextResponse } from 'next/server'
import { getCampaignMetrics } from '@/lib/analytics/campaigns'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    const metrics = await getCampaignMetrics(start, end)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching campaign metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign metrics' },
      { status: 500 }
    )
  }
}






