/**
 * Analytics export utilities
 */

import { EnhancedAnalyticsData } from './enhanced'

/**
 * Export analytics data to CSV format
 */
export function exportToCSV(data: EnhancedAnalyticsData, filename: string = 'analytics') {
  const rows: string[] = []

  // Overview section
  rows.push('Analytics Overview')
  rows.push('Metric,Value')
  rows.push(`Average Time on Page,${data.averageTimeOnPage}s`)
  rows.push(`Average Scroll Depth,${data.averageScrollDepth}%`)
  rows.push(`Total Sessions,${data.totalSessions}`)
  rows.push(`Total Events,${data.totalEvents}`)
  rows.push('')

  // Traffic sources
  rows.push('Traffic Sources')
  rows.push('Source,Count,Percentage')
  data.trafficSources.forEach((source) => {
    rows.push(`${source.source},${source.count},${source.percentage}%`)
  })
  rows.push('')

  // Device breakdown
  rows.push('Device Breakdown')
  rows.push('Device Type,Count,Percentage')
  data.deviceBreakdown.forEach((device) => {
    rows.push(`${device.deviceType},${device.count},${device.percentage}%`)
  })
  rows.push('')

  // Browser breakdown
  rows.push('Browser Breakdown')
  rows.push('Browser,Count,Percentage')
  data.browserBreakdown.forEach((browser) => {
    rows.push(`${browser.browser},${browser.count},${browser.percentage}%`)
  })
  rows.push('')

  // Top countries
  rows.push('Top Countries')
  rows.push('Country,Count,Percentage')
  data.topCountries.forEach((country) => {
    rows.push(`${country.country},${country.count},${country.percentage}%`)
  })
  rows.push('')

  // Daily views
  rows.push('Daily Views')
  rows.push('Date,Views,Sessions')
  data.dailyViews.forEach((day) => {
    rows.push(`${day.date},${day.views},${day.sessions}`)
  })

  // Create CSV content
  const csvContent = rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export analytics data to JSON format (for PDF generation)
 */
export function exportToJSON(data: EnhancedAnalyticsData): string {
  return JSON.stringify(data, null, 2)
}






