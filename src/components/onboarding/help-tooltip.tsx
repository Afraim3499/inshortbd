'use client'

import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { isTooltipDismissed, dismissTooltip } from '@/lib/onboarding/storage'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
  tooltipId: string
  content: string | React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  dismissible?: boolean
}

export function HelpTooltip({
  tooltipId,
  content,
  side = 'top',
  className,
  dismissible = true,
}: HelpTooltipProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined' && dismissible) {
      return isTooltipDismissed(tooltipId)
    }
    return false
  })
  const [isOpen, setIsOpen] = useState(false)

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dismissible) {
      dismissTooltip(tooltipId)
      setIsDismissed(true)
      setIsOpen(false)
    }
  }

  if (isDismissed) return null

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'text-zinc-400 hover:text-zinc-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900',
              className
            )}
            aria-label="Show help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs bg-zinc-900 border-zinc-800 text-zinc-50 p-3"
        >
          <div className="relative">
            {dismissible && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-1 -right-1 h-5 w-5 text-zinc-400 hover:text-zinc-50"
                onClick={handleDismiss}
                aria-label="Dismiss tooltip"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <div className="pr-4 text-sm">{content}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}






