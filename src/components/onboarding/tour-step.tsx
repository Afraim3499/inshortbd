'use client'

import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface TourStepProps {
  target: string | null
  title: string
  content: React.ReactNode
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  onDismiss: () => void
}

export function TourStep({
  target,
  title,
  content,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onDismiss,
}: TourStepProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!target) return

    const element = document.querySelector(target)
    if (!element) return

    const rect = element.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

    // Wait for scroll, then position highlight
    setTimeout(() => {
      const newRect = element.getBoundingClientRect()
      if (highlightRef.current) {
        highlightRef.current.style.top = `${newRect.top + scrollTop}px`
        highlightRef.current.style.left = `${newRect.left + scrollLeft}px`
        highlightRef.current.style.width = `${newRect.width}px`
        highlightRef.current.style.height = `${newRect.height}px`
        highlightRef.current.style.display = 'block'
      }
    }, 300)
  }, [target])

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] bg-black/60 transition-opacity"
        onClick={(e) => {
          // Only close on overlay click, not on highlight area
          if (e.target === overlayRef.current) {
            onSkip()
          }
        }}
      />

      {/* Highlight */}
      {target && (
        <div
          ref={highlightRef}
          className="fixed z-[9999] rounded-md border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none transition-all"
          style={{ display: 'none' }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          'fixed z-[10000] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl',
          'max-w-md p-6 text-zinc-50',
          'animate-in fade-in-0 zoom-in-95'
        )}
        style={
          target
            ? {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
            : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-50 mb-1">{title}</h3>
            <p className="text-xs text-zinc-400">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            className="h-6 w-6 text-zinc-400 hover:text-zinc-50"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-6 text-sm text-zinc-300">{content}</div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onSkip} className="text-zinc-400 hover:text-zinc-50">
            Skip Tour
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStep === 1}
              className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={currentStep === totalSteps ? onDismiss : onNext}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {currentStep === totalSteps ? 'Finish' : 'Next'}
              {currentStep < totalSteps && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}






