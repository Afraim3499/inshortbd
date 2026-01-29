import { EnhancedAnalyticsData } from './enhanced'

/**
 * Export analytics data to PDF
 */
export async function exportToPDF(
  data: EnhancedAnalyticsData,
  filename: string = 'analytics-report'
): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  let yPos = margin

  // Header
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246) // Blue 500
  doc.text('Inshort - Analytics Report', margin, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos)
  yPos += 15

  // Overview Section
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Overview', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  const overviewData = [
    ['Average Time on Page', `${data.averageTimeOnPage.toFixed(1)}s`],
    ['Average Scroll Depth', `${data.averageScrollDepth.toFixed(1)}%`],
    ['Total Sessions', data.totalSessions.toLocaleString()],
    ['Total Events', data.totalEvents.toLocaleString()],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: overviewData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    margin: { left: margin, right: margin },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // Traffic Sources
  if (data.trafficSources.length > 0) {
    doc.setFontSize(16)
    doc.text('Traffic Sources', margin, yPos)
    yPos += 8

    const trafficData = data.trafficSources.map((source) => [
      source.source,
      source.count.toLocaleString(),
      `${source.percentage.toFixed(1)}%`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Source', 'Count', 'Percentage']],
      body: trafficData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Device Breakdown
  if (data.deviceBreakdown.length > 0) {
    doc.setFontSize(16)
    doc.text('Device Breakdown', margin, yPos)
    yPos += 8

    const deviceData = data.deviceBreakdown.map((device) => [
      device.deviceType,
      device.count.toLocaleString(),
      `${device.percentage.toFixed(1)}%`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Device Type', 'Count', 'Percentage']],
      body: deviceData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Browser Breakdown
  if (data.browserBreakdown.length > 0) {
    doc.setFontSize(16)
    doc.text('Browser Breakdown', margin, yPos)
    yPos += 8

    const browserData = data.browserBreakdown.map((browser) => [
      browser.browser,
      browser.count.toLocaleString(),
      `${browser.percentage.toFixed(1)}%`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Browser', 'Count', 'Percentage']],
      body: browserData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Top Countries
  if (data.topCountries.length > 0) {
    doc.setFontSize(16)
    doc.text('Top Countries', margin, yPos)
    yPos += 8

    const countryData = data.topCountries.map((country) => [
      country.country,
      country.count.toLocaleString(),
      `${country.percentage.toFixed(1)}%`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Country', 'Count', 'Percentage']],
      body: countryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    })
  }

  // Save PDF
  const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(finalFilename)
}






