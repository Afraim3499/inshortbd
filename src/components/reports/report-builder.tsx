'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'
import { exportToCSV } from '@/lib/analytics/export'
import { exportToPDF } from '@/lib/analytics/export-pdf'
import type { EnhancedAnalyticsData } from '@/lib/analytics/enhanced'

interface ReportBuilderProps {
  analyticsData: EnhancedAnalyticsData | null
  onDataChange?: (data: EnhancedAnalyticsData) => void
}

const availableMetrics = [
  { id: 'overview', label: 'Overview Metrics', defaultChecked: true },
  { id: 'traffic-sources', label: 'Traffic Sources', defaultChecked: true },
  { id: 'devices', label: 'Device Breakdown', defaultChecked: true },
  { id: 'browsers', label: 'Browser Breakdown', defaultChecked: true },
  { id: 'countries', label: 'Top Countries', defaultChecked: true },
  { id: 'daily-views', label: 'Daily Views', defaultChecked: true },
]

export function ReportBuilder({ analyticsData, onDataChange }: ReportBuilderProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    availableMetrics.filter((m) => m.defaultChecked).map((m) => m.id)
  )
  const [reportName, setReportName] = useState('')
  const [dateRange, setDateRange] = useState(() => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  }))

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId]
    )
  }

  const handleExportCSV = () => {
    if (analyticsData) {
      exportToCSV(analyticsData, reportName || 'analytics-report')
    }
  }

  const handleExportPDF = async () => {
    if (analyticsData) {
      await exportToPDF(analyticsData, reportName || 'analytics-report')
    }
  }

  const handleLoadData = async () => {
    try {
      const response = await fetch(
        `/api/analytics/data?start=${dateRange.start}&end=${dateRange.end}`
      )
      if (response.ok && onDataChange) {
        const data = await response.json()
        onDataChange(data)
      }
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Select metrics to include in your report and customize export settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Q4 2024 Analytics Report"
              className="bg-zinc-800 border-zinc-700 text-zinc-50"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="bg-zinc-800 border-zinc-700 text-zinc-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="bg-zinc-800 border-zinc-700 text-zinc-50"
              />
            </div>
          </div>

          <Button
            onClick={handleLoadData}
            variant="outline"
            className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Load Data for Date Range
          </Button>

          {/* Metric Selection */}
          <div className="space-y-4">
            <Label>Select Metrics to Include</Label>
            <div className="grid grid-cols-2 gap-4">
              {availableMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                  <Label
                    htmlFor={metric.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex gap-4 pt-4 border-t border-zinc-800">
            <Button
              onClick={handleExportCSV}
              disabled={!analyticsData || selectedMetrics.length === 0}
              variant="outline"
              className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
            >
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={!analyticsData || selectedMetrics.length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






