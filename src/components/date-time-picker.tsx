'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import 'react-datepicker/dist/react-datepicker.css'

interface DateTimePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  className?: string
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {value ? (
          <span suppressHydrationWarning>
            {value.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        ) : (
          <span>Select date & time</span>
        )}
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2">
            <DatePicker
              selected={value}
              onChange={(date: Date | null) => {
                onChange(date)
                setIsOpen(false)
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              inline
              className="bg-card border border-border rounded-md"
            />
          </div>
        </>
      )}
    </div>
  )
}






