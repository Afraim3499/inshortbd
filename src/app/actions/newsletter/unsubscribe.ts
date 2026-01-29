'use server'

import { createClient } from '@/utils/supabase/server'

export interface UnsubscribeResult {
  success: boolean
  error?: string
  message?: string
}

export async function unsubscribeFromNewsletter(token: string): Promise<UnsubscribeResult> {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Invalid unsubscribe link',
      }
    }

    const supabase = await createClient()

    // Find subscriber by token
    // Note: newsletter_subscribers table may not be in generated Database types
    const { data: subscriber, error: findError } = await (supabase
      .from('newsletter_subscribers') as any)
      .select('id, email, status')
      .eq('unsubscribe_token', token)
      .maybeSingle()

    if (findError || !subscriber) {
      return {
        success: false,
        error: 'Invalid unsubscribe link. Please contact support.',
      }
    }

    if (subscriber.status === 'unsubscribed') {
      return {
        success: true,
        message: 'You are already unsubscribed.',
      }
    }

    // Update status to unsubscribed
    const { error: updateError } = await (supabase
      .from('newsletter_subscribers') as any)
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id)

    if (updateError) {
      console.error('Unsubscribe error:', updateError)
      return {
        success: false,
        error: 'Failed to unsubscribe. Please try again.',
      }
    }

    return {
      success: true,
      message: 'Successfully unsubscribed from the newsletter.',
    }
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}





