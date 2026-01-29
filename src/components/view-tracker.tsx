'use client'

import { useEffect } from 'react'
import { incrementViewCount } from '@/app/actions/view-tracking'

interface ViewTrackerProps {
  postId: string
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // Increment view count when component mounts
    incrementViewCount(postId)
  }, [postId])

  return null
}






