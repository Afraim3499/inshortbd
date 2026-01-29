'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CampaignMetrics } from '@/lib/analytics/campaigns'
import { formatDistanceToNow } from 'date-fns'

interface CampaignsTableProps {
  campaigns: CampaignMetrics[]
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-zinc-400">
            No campaign data available. Create UTM-tracked URLs in the Campaigns page.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Campaign</TableHead>
                <TableHead className="text-zinc-400">Sessions</TableHead>
                <TableHead className="text-zinc-400">Page Views</TableHead>
                <TableHead className="text-zinc-400">Avg Time</TableHead>
                <TableHead className="text-zinc-400">Avg Scroll</TableHead>
                <TableHead className="text-zinc-400">Top Source</TableHead>
                <TableHead className="text-zinc-400">Top Medium</TableHead>
                <TableHead className="text-zinc-400">% of Traffic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign, index) => (
                <TableRow key={index} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-50">
                    {campaign.campaign}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {campaign.sessions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {campaign.pageViews.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {Math.round(campaign.avgTimeOnPage / 60)}m {campaign.avgTimeOnPage % 60}s
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {campaign.avgScrollDepth}%
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {campaign.topSource || 'N/A'}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {campaign.topMedium || 'N/A'}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {campaign.percentage}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}






