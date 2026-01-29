'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function CampaignsPage() {
  const supabase = createClient()

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['newsletter-campaigns'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('newsletter_campaigns') as any)
        .select('id, subject, type, status, sent_count, opened_count, clicked_count, sent_at, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as Array<{
        id: string
        subject: string
        type: string
        status: string
        sent_count: number | null
        opened_count: number | null
        clicked_count: number | null
        sent_at: string | null
        created_at: string
      }>
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
        <h1 className="text-3xl font-heading font-bold">Campaigns</h1>
        <Link href="/admin/newsletter/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const openRate = campaign.sent_count
                      ? Math.round((campaign.opened_count || 0) / campaign.sent_count * 100)
                      : 0

                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.status === 'sent'
                                ? 'default'
                                : campaign.status === 'sending'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.sent_count || 0}</TableCell>
                        <TableCell>
                          {campaign.opened_count || 0} ({openRate}%)
                        </TableCell>
                        <TableCell>{campaign.clicked_count || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {campaign.sent_at
                            ? new Date(campaign.sent_at).toLocaleDateString()
                            : new Date(campaign.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No campaigns yet. Create your first campaign!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





