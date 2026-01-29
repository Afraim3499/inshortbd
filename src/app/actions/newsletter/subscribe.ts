'use server'

import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { getWelcomeEmailHtml } from '@/lib/email/templates/welcome'
import { getUnsubscribeUrl } from '@/lib/email/resend'

export interface SubscribeResult {
  success: boolean
  error?: string
  message?: string
}

export async function subscribeToNewsletter(
  email: string,
  name?: string,
  source?: string
): Promise<SubscribeResult> {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      }
    }

    const supabase = await createClient()

    // Check if already subscribed
    // Note: newsletter_subscribers table may not be in generated Database types
    const { data: existing } = await (supabase
      .from('newsletter_subscribers') as any)
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      if (existing.status === 'active') {
        return {
          success: false,
          error: 'This email is already subscribed to our newsletter',
        }
      }

      // If unsubscribed before, reactivate
      const unsubscribeToken = crypto.randomUUID()
      const { error: updateError } = await (supabase
        .from('newsletter_subscribers') as any)
        .update({
          status: 'active',
          name: name || null,
          source: source || null,
          subscribed_at: new Date().toISOString(),
          unsubscribe_token: unsubscribeToken,
          unsubscribed_at: null,
        })
        .eq('id', existing.id)

      if (updateError) {
        return {
          success: false,
          error: 'Failed to resubscribe. Please try again.',
        }
      }

      // Send welcome email
      const welcomeHtml = getWelcomeEmailHtml({
        name: name || undefined,
        unsubscribeUrl: getUnsubscribeUrl(unsubscribeToken),
      })

      await sendEmail({
        to: email,
        subject: 'Welcome to Inshort Newsletter',
        html: welcomeHtml,
      })

      return {
        success: true,
        message: 'Successfully resubscribed to the newsletter!',
      }
    }

    // Create new subscriber
    const unsubscribeToken = crypto.randomUUID()
    const { data: subscriber, error: insertError } = await (supabase
      .from('newsletter_subscribers') as any)
      .insert({
        email: email.toLowerCase().trim(),
        name: name || null,
        status: 'active',
        source: source || null,
        unsubscribe_token: unsubscribeToken,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Newsletter subscription error:', insertError)
      return {
        success: false,
        error: 'Failed to subscribe. Please try again.',
      }
    }

    // Send welcome email
    const welcomeHtml = getWelcomeEmailHtml({
      name: name || undefined,
      unsubscribeUrl: getUnsubscribeUrl(unsubscribeToken),
    })

    const emailResult = await sendEmail({
      to: email,
      subject: 'Welcome to Inshort Newsletter',
      html: welcomeHtml,
    })

    if (!emailResult.success) {
      console.warn('Welcome email failed to send:', emailResult.error)
      // Don't fail the subscription if email fails
    }

    return {
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}





