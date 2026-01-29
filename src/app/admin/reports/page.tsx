'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedAnalyticsData } from '@/lib/analytics/enhanced'
import { ReportBuilder } from '@/components/reports/report-builder'
import { exportToCSV } from '@/lib/analytics/export'
import { exportToPDF } from '@/lib/analytics/export-pdf'
import { FileText, FileSpreadsheet } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ReportsPage() {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/analytics/data?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      )
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (data) {
      exportToCSV(data)
    }
  }

  const handleExportPDF = async () => {
    if (data) {
      await exportToPDF(data)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-400">Loading analytics data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Custom Reports</h1>
        <p className="text-zinc-400 mt-1">Export analytics data in various formats</p>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="quick-export">Quick Export</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <ReportBuilder analyticsData={data} onDataChange={setData} />
        </TabsContent>

        <TabsContent value="quick-export">
          <div className="space-y-6">
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleExportCSV}
                disabled={!data}
                variant="outline"
                className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={!data}
                variant="outline"
                className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>

            {data && (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                  <CardDescription>
                    Overview of analytics data for the selected date range
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Total Sessions</p>
                      <p className="text-2xl font-bold text-zinc-50">{data.totalSessions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Total Events</p>
                      <p className="text-2xl font-bold text-zinc-50">{data.totalEvents.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Avg Time on Page</p>
                      <p className="text-2xl font-bold text-zinc-50">{Math.round(data.averageTimeOnPage)}s</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Avg Scroll Depth</p>
                      <p className="text-2xl font-bold text-zinc-50">{Math.round(data.averageScrollDepth)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
