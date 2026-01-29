'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, MousePointerClick, Globe, Monitor, Smartphone, Tablet } from 'lucide-react'
import { TrafficSourcesChart } from './charts/traffic-sources-chart'
import { DeviceBreakdownChart } from './charts/device-breakdown-chart'
import { DailyViewsChart } from './charts/daily-views-chart'
import { BrowserBreakdownChart } from './charts/browser-breakdown-chart'
import { AnalyticsFilters } from './analytics-filters'
import { exportToCSV } from '@/lib/analytics/export'
import type { EnhancedAnalyticsData } from '@/lib/analytics/enhanced'

interface EnhancedDashboardProps {
  initialData: EnhancedAnalyticsData
}

export function EnhancedDashboard({ initialData }: EnhancedDashboardProps) {
  const [data, setData] = useState<EnhancedAnalyticsData>(initialData)
  const [loading, setLoading] = useState(false)

  const handleDateRangeChange = async (startDate: Date, endDate: Date) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/analytics/data?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      )
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(data)
  }

  const handleExportPDF = async () => {
    try {
      const { exportToPDF } = await import('@/lib/analytics/export-pdf')
      await exportToPDF(data, 'analytics-report')
    } catch (error) {
      console.error('Failed to export PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <AnalyticsFilters
        onDateRangeChange={handleDateRangeChange}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time on Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${Math.round(data.averageTimeOnPage / 60)}m ${data.averageTimeOnPage % 60}s`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average engagement time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Scroll Depth</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${data.averageScrollDepth}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average scroll percentage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : data.totalSessions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">User sessions tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : data.totalEvents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Analytics events recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficSourcesChart data={data.trafficSources} />
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceBreakdownChart data={data.deviceBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Daily Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Views & Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyViewsChart data={data.dailyViews} />
        </CardContent>
      </Card>

      {/* Browser & Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browser Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <BrowserBreakdownChart data={data.browserBreakdown} />
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCountries.length > 0 ? (
                data.topCountries.map((country, index) => (
                  <div key={country.country} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{country.country}</span>
                      <span className="text-sm text-muted-foreground">
                        {country.count} sessions ({country.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-accent h-full transition-all"
                        style={{
                          width: `${country.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No geographic data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

