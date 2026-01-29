import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/app/actions/newsletter/subscribe'

/**
 * API endpoint for newsletter subscription
 * Handles public subscription requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await subscribeToNewsletter(email, name, source)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Newsletter subscription API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}






