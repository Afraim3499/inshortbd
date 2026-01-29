import { NextRequest, NextResponse } from 'next/server'
import { sendDeadlineReminders } from '@/app/actions/assignments/send-reminders'
import { getEnv } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const env = getEnv()
    
    if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sendDeadlineReminders()

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in reminders cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






