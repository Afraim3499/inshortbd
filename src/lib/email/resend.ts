/**
 * Resend email service client
 * Handles all email sending through Resend API
 */

import { Resend } from 'resend'
import { getEnv, getSiteUrl } from '@/lib/env'

let resendClient: Resend | null = null

export function getResendClient(): Resend | null {
  if (typeof window !== 'undefined') {
    // Client-side: return null (email should only be sent server-side)
    return null
  }

  if (!resendClient) {
    const env = getEnv()
    if (!env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email functionality will be disabled.')
      return null
    }
    resendClient = new Resend(env.RESEND_API_KEY)
  }

  return resendClient
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient()

  if (!resend) {
    return {
      success: false,
      error: 'Email service not configured. Please set RESEND_API_KEY environment variable.',
    }
  }

  try {
    const from = options.from || 'Inshort <noreply@inshortbd.com>'

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    })

    if (error) {
      console.error('Resend email error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export function getUnsubscribeUrl(token: string): string {
  const siteUrl = getSiteUrl()
  return `${siteUrl}/newsletter/unsubscribe?token=${token}`
}





