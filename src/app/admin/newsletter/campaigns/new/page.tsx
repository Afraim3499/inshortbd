'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save } from 'lucide-react'
import { sendEmail } from '@/lib/email/resend'
import { getCampaignEmailHtml } from '@/lib/email/templates/campaign'

export default function NewCampaignPage() {
  const router = useRouter()
  const supabase = createClient()
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!subject.trim() || !content.trim()) {
        throw new Error('Subject and content are required')
      }

      // Get all active subscribers
      const { data: subscribers, error: subscribersError } = await (supabase
        .from('newsletter_subscribers') as any)
        .select('id, email, unsubscribe_token')
        .eq('status', 'active')

      if (subscribersError) throw subscribersError
      if (!subscribers || subscribers.length === 0) {
        throw new Error('No active subscribers found')
      }

      // Type assertion for subscribers
      const typedSubscribers = (subscribers || []) as Array<{
        id: string
        email: string
        unsubscribe_token: string
      }>

      // Create campaign record
      const { data: campaign, error: campaignError } = await (supabase
        .from('newsletter_campaigns') as any)
        .insert({
          subject,
          content,
          type: 'campaign',
          status: 'sending',
        })
        .select()
        .single()

      if (campaignError) throw campaignError

      // Send emails in batches
      const batchSize = 50
      let sentCount = 0

      for (let i = 0; i < typedSubscribers.length; i += batchSize) {
        const batch = typedSubscribers.slice(i, i + batchSize)

        await Promise.all(
          batch.map(async (subscriber: any) => {
            const emailHtml = getCampaignEmailHtml({
              subject,
              content,
              unsubscribeToken: subscriber.unsubscribe_token,
            })

            const result = await sendEmail({
              to: subscriber.email,
              subject,
              html: emailHtml,
            })

            if (result.success) {
              await (supabase.from('newsletter_sends') as any).insert({
                campaign_id: campaign.id,
                subscriber_id: subscriber.id,
                status: 'sent',
              })
              sentCount++
            }
          })
        )

        // Rate limiting
        if (i + batchSize < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      // Update campaign
      await (supabase
        .from('newsletter_campaigns') as any)
        .update({
          status: 'sent',
          sent_count: sentCount,
          sent_at: new Date().toISOString(),
        })
        .eq('id', campaign.id)

      return { success: true, sent: sentCount }
    },
    onSuccess: () => {
      router.push('/admin/newsletter/campaigns')
    },
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">New Campaign</h1>
      </div>

      {sendMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {sendMutation.error instanceof Error
              ? sendMutation.error.message
              : 'Failed to send campaign'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Email content (HTML supported)..."
            className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            You can use HTML formatting in the email content
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending || !subject.trim() || !content.trim()}
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Send Campaign
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={sendMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}





