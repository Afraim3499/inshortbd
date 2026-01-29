'use client'

import { useEffect, useRef } from 'react'

interface ScrollTrackerProps {
  postId: string
  sessionId: string
}

export function ScrollTracker({ postId, sessionId }: ScrollTrackerProps) {
  const reportedDepthsRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight

          // Calculate scroll depth as percentage
          const scrollDepth = Math.round(
            ((scrollTop + windowHeight) / documentHeight) * 100
          )

          // Report at 25%, 50%, 75%, and 100% milestones
          const milestones = [25, 50, 75, 100]
          const reachedMilestone = milestones.find(
            (milestone) => scrollDepth >= milestone && !reportedDepthsRef.current.has(milestone)
          )

          if (reachedMilestone) {
            reportedDepthsRef.current.add(reachedMilestone)

            // Track scroll event
            fetch('/api/analytics/events', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId,
                postId,
                eventType: 'scroll',
                eventData: {
                  scrollDepth: reachedMilestone,
                  scrollPosition: scrollTop,
                },
              }),
            }).catch((error) => {
              console.error('Error tracking scroll:', error)
            })
          }

          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [postId, sessionId])

  return null
}






