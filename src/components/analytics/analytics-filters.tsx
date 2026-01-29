'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Download } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AnalyticsFiltersProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void
  onExportCSV: () => void
  onExportPDF: () => void
}

export function AnalyticsFilters({
  onDateRangeChange,
  onExportCSV,
  onExportPDF,
}: AnalyticsFiltersProps) {
  const [dateRange, setDateRange] = useState<string>('30')

  const handleDateRangeChange = (range: string) => {
    setDateRange(range)
    const endDate = new Date()
    const startDate = new Date()

    switch (range) {
      case '7':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '365':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    onDateRangeChange(startDate, endDate)
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Period:</span>
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
    </div>
  )
}






