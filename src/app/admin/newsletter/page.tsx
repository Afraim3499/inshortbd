'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Mail, Send, TrendingUp, Plus } from 'lucide-react'
import { Loader2 } from 'lucide-react'

export default function NewsletterPage() {
  const supabase = createClient()

  // Fetch newsletter stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['newsletter-stats'],
    queryFn: async () => {
      const [subscribersRes, campaignsRes] = await Promise.all([
        (supabase
          .from('newsletter_subscribers') as any)
          .select('id, status')
          .eq('status', 'active'),
        (supabase
          .from('newsletter_campaigns') as any)
          .select('id, sent_count, opened_count, clicked_count, status'),
      ])

      const subscribers = (subscribersRes.data || []) as Array<{ id: string; status: string }>
      const campaigns = (campaignsRes.data || []) as Array<{
        id: string
        sent_count: number | null
        opened_count: number | null
        clicked_count: number | null
        status: string
      }>

      const totalSubscribers = subscribers.length
      const totalSent = campaigns.reduce((sum: number, c: any) => sum + (c.sent_count || 0), 0)
      const totalOpened = campaigns.reduce((sum: number, c: any) => sum + (c.opened_count || 0), 0)
      const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0

      return {
        totalSubscribers,
        totalSent,
        totalOpened,
        openRate,
        totalCampaigns: campaigns.length,
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Newsletter</h1>
        <div className="flex gap-2">
          <Link href="/admin/newsletter/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSent || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Emails sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalOpened || 0} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
          <Link href="/admin/newsletter/subscribers">
            <CardHeader>
              <CardTitle className="text-lg">Manage Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View, export, and manage your newsletter subscribers
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
          <Link href="/admin/newsletter/campaigns">
            <CardHeader>
              <CardTitle className="text-lg">Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and manage email campaigns
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
          <Link href="/admin/newsletter/campaigns/new">
            <CardHeader>
              <CardTitle className="text-lg">New Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create a new email campaign
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}





