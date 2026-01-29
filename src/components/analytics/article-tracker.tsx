'use client'

import { useEffect, useState } from 'react'
import { getSessionId } from '@/lib/analytics/session'
import { getDeviceInfo } from '@/lib/analytics/device'
import { getTrafficSourceData } from '@/lib/analytics/sources'
import { TimeTracker } from './time-tracker'
import { ScrollTracker } from './scroll-tracker'

interface ArticleTrackerProps {
  postId: string
}

export function ArticleTracker({ postId }: ArticleTrackerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    async function initializeTracking() {
      const session = getSessionId()
      setSessionId(session)

      const deviceInfo = getDeviceInfo()
      const trafficSource = getTrafficSourceData()

      try {
        // Create/update session
        const response = await fetch('/api/analytics/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session,
            postId,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            browserVersion: deviceInfo.browserVersion,
            os: deviceInfo.os,
            osVersion: deviceInfo.osVersion,
            country: null, // Will be set server-side from IP
            city: null, // Will be set server-side from IP
            referrer: trafficSource.referrer,
            trafficSource: trafficSource.source,
            utmSource: trafficSource.utmSource,
            utmMedium: trafficSource.utmMedium,
            utmCampaign: trafficSource.utmCampaign,
          }),
        })

        if (response.ok) {
          // Track initial page view event
          await fetch('/api/analytics/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: session,
              postId,
              eventType: 'page_view',
              eventData: {},
            }),
          })
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing analytics:', error)
        setIsInitialized(true) // Still set initialized to prevent retry loops
      }
    }

    initializeTracking()

    // Track exit event when user leaves
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Use sendBeacon for reliable tracking on page unload
        navigator.sendBeacon(
          '/api/analytics/events',
          JSON.stringify({
            sessionId,
            postId,
            eventType: 'exit',
            eventData: {},
          })
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [postId, sessionId])

  if (!isInitialized || !sessionId) {
    return null
  }

  return (
    <>
      <TimeTracker postId={postId} sessionId={sessionId} />
      <ScrollTracker postId={postId} sessionId={sessionId} />
    </>
  )
}






