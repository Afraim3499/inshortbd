'use client'

import { useEffect, useRef } from 'react'

interface TimeTrackerProps {
  postId: string
  sessionId: string
}

export function TimeTracker({ postId, sessionId }: TimeTrackerProps) {
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastReportedTimeRef = useRef<number>(0)

  useEffect(() => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now()
    }

    // Track time every 30 seconds
    intervalRef.current = setInterval(async () => {
      const currentTime = Date.now()
      const timeSpent = Math.floor((currentTime - startTimeRef.current) / 1000) // seconds

      // Only report if at least 10 seconds have passed since last report
      if (timeSpent - lastReportedTimeRef.current >= 10) {
        try {
          await fetch('/api/analytics/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              postId,
              eventType: 'time',
              eventData: {
                timeSeconds: timeSpent,
              },
            }),
          })
          lastReportedTimeRef.current = timeSpent
        } catch (error) {
          console.error('Error tracking time:', error)
        }
      }
    }, 30000) // Check every 30 seconds

    // Track final time when component unmounts (user leaves page)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Report final time
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
      if (finalTime > 0) {
        fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            postId,
            eventType: 'time',
            eventData: {
              timeSeconds: finalTime,
              isFinal: true,
            },
          }),
        }).catch((error) => {
          console.error('Error tracking final time:', error)
        })
      }
    }
  }, [postId, sessionId])

  return null
}






