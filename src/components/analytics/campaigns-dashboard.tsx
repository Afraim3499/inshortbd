'use client'

import { useState, useEffect } from 'react'
import { CampaignsTable } from './campaigns-table'
import { CampaignsChart } from './campaigns-chart'
import { AnalyticsFilters } from './analytics-filters'
import type { CampaignMetrics } from '@/lib/analytics/campaigns'

export function CampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  useEffect(() => {
    loadCampaigns()
  }, [dateRange])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/analytics/campaigns?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      )
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Error loading campaign data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
  }

  const handleExportCSV = () => {
    const rows: string[] = []
    
    // Header
    rows.push('Campaign Analytics')
    rows.push(`Date Range: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`)
    rows.push('')
    
    // Column headers
    rows.push('Campaign,Sessions,Page Views,Avg Time on Page (s),Avg Scroll Depth (%),Top Source,Top Medium,Percentage')
    
    // Data rows
    campaigns.forEach((campaign) => {
      rows.push(
        `${campaign.campaign},${campaign.sessions},${campaign.pageViews},${campaign.avgTimeOnPage},${campaign.avgScrollDepth},${campaign.topSource},${campaign.topMedium},${campaign.percentage}%`
      )
    })
    
    // Create CSV content
    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `campaigns_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = async () => {
    try {
      const { exportToPDF } = await import('@/lib/analytics/export-pdf')
      // Create a simplified data structure for PDF export
      const pdfData = {
        title: 'Campaign Analytics Report',
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
        campaigns: campaigns.map((c) => ({
          campaign: c.campaign,
          sessions: c.sessions,
          pageViews: c.pageViews,
          avgTimeOnPage: c.avgTimeOnPage,
          avgScrollDepth: c.avgScrollDepth,
          topSource: c.topSource,
          topMedium: c.topMedium,
          percentage: c.percentage,
        })),
      }
      await exportToPDF(pdfData as any, 'campaigns-report')
    } catch (error) {
      console.error('Failed to export PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-400">Loading campaign data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnalyticsFilters
        onDateRangeChange={handleDateRangeChange}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />
      <CampaignsChart campaigns={campaigns} />
      <CampaignsTable campaigns={campaigns} />
    </div>
  )
}





