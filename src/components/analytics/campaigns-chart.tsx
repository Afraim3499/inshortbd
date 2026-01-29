'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CampaignMetrics } from '@/lib/analytics/campaigns'

interface CampaignsChartProps {
  campaigns: CampaignMetrics[]
}

export function CampaignsChart({ campaigns }: CampaignsChartProps) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-zinc-400">
            No campaign data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = campaigns.map((campaign) => ({
    name: campaign.campaign.length > 20 
      ? campaign.campaign.substring(0, 20) + '...' 
      : campaign.campaign,
    fullName: campaign.campaign,
    sessions: campaign.sessions,
    pageViews: campaign.pageViews,
    avgTime: Math.round(campaign.avgTimeOnPage / 60), // Convert to minutes
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                color: '#fafafa',
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName
                }
                return label
              }}
            />
            <Legend />
            <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
            <Bar dataKey="pageViews" fill="#8b5cf6" name="Page Views" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}






