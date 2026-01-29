'use server'

import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { getNewArticleEmailHtml } from '@/lib/email/templates/new-article'
import { getSiteUrl } from '@/lib/env'

export interface SendNewArticleResult {
  success: boolean
  sent?: number
  error?: string
}

/**
 * Send new article notification to all active newsletter subscribers
 * Called automatically when a post is published
 */
export async function sendNewArticleToSubscribers(postId: string): Promise<SendNewArticleResult> {
  try {
    const supabase = await createClient()

    // Get post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, title, excerpt, slug, category, featured_image_url, published_at, author_id')
      .eq('id', postId)
      .eq('status', 'published')
      .single()

    if (postError || !post) {
      return {
        success: false,
        error: 'Post not found or not published',
      }
    }

    // Type assertion for post query result
    const typedPost = post as {
      id: string
      title: string
      excerpt: string | null
      slug: string
      category: string | null
      featured_image_url: string | null
      published_at: string | null
      author_id: string | null
    }

    // Get author name
    let authorName: string | undefined
    if (typedPost.author_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', typedPost.author_id)
        .single()
      
      // Type assertion for profile query result
      const typedProfile = profile as { full_name: string | null } | null
      authorName = typedProfile?.full_name || undefined
    }

    // Get all active subscribers
    // Note: newsletter_subscribers table may not be in generated Database types
    const { data: subscribers, error: subscribersError } = await (supabase
      .from('newsletter_subscribers') as any)
      .select('id, email, unsubscribe_token')
      .eq('status', 'active')

    if (subscribersError) {
      return {
        success: false,
        error: 'Failed to fetch subscribers',
      }
    }

    if (!subscribers || subscribers.length === 0) {
      return {
        success: true,
        sent: 0,
      }
    }

    // Create campaign record
    // Note: newsletter_campaigns table may not be in generated Database types
    const { data: campaign, error: campaignError } = await (supabase
      .from('newsletter_campaigns') as any)
      .insert({
        subject: typedPost.title,
        content: '', // Will be generated from template
        type: 'article',
        post_id: typedPost.id,
        status: 'sending',
      })
      .select()
      .single()

    if (campaignError || !campaign) {
      console.error('Failed to create campaign:', campaignError)
      // Continue anyway
    }

    // Send emails in batches (Resend has rate limits)
    const batchSize = 50
    let sentCount = 0
    const errors: string[] = []

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (subscriber: any) => {
          try {
            const emailHtml = getNewArticleEmailHtml({
              post: {
                title: typedPost.title,
                excerpt: typedPost.excerpt || '',
                slug: typedPost.slug,
                category: typedPost.category || '',
                featured_image_url: typedPost.featured_image_url || '',
                author_name: authorName,
                published_at: typedPost.published_at || new Date().toISOString(),
              },
              unsubscribeToken: subscriber.unsubscribe_token,
            })

            const result = await sendEmail({
              to: subscriber.email,
              subject: `New Article: ${typedPost.title}`,
              html: emailHtml,
            })

            if (result.success && campaign) {
              // Record send
              // Note: newsletter_sends table may not be in generated Database types
              await (supabase.from('newsletter_sends') as any).insert({
                campaign_id: campaign.id,
                subscriber_id: subscriber.id,
                status: 'sent',
              })

              sentCount++
            } else {
              errors.push(`Failed to send to ${subscriber.email}: ${result.error}`)
              
              if (campaign) {
                // Note: newsletter_sends table may not be in generated Database types
                await (supabase.from('newsletter_sends') as any).insert({
                  campaign_id: campaign.id,
                  subscriber_id: subscriber.id,
                  status: 'failed',
                })
              }
            }
          } catch (error) {
            errors.push(`Error sending to ${subscriber.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        })
      )

      // Rate limiting: wait 1 second between batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Update campaign status
    if (campaign) {
      // Note: newsletter_campaigns table may not be in generated Database types
      await (supabase
        .from('newsletter_campaigns') as any)
        .update({
          status: 'sent',
          sent_count: sentCount,
          sent_at: new Date().toISOString(),
        })
        .eq('id', campaign.id)
    }

    if (errors.length > 0) {
      console.warn('Some emails failed to send:', errors.slice(0, 5))
    }

    return {
      success: true,
      sent: sentCount,
    }
  } catch (error) {
    console.error('Send new article error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send newsletter',
    }
  }
}





