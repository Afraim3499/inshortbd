'use client'

import { useEffect, useState, useCallback } from 'react'
import { TourStep } from './tour-step'
import { hasCompletedTour, markTourCompleted } from '@/lib/onboarding/storage'
import { createClient } from '@/utils/supabase/client'

interface TourStepData {
  target: string | null // CSS selector or null for centered
  title: string
  content: React.ReactNode
}

const tourSteps: TourStepData[] = [
  {
    target: null,
    title: 'Welcome to Inshort Admin',
    content: (
      <p>
        Welcome! This quick tour will help you get started with Inshort admin dashboard.
        You&apos;ll learn about the key features and how to navigate the platform.
      </p>
    ),
  },
  {
    target: '[href="/admin/dashboard"]',
    title: 'Dashboard',
    content: (
      <p>
        The Dashboard gives you an overview of your site&apos;s performance, recent activity,
        and quick access to important metrics. Check here for insights at a glance.
      </p>
    ),
  },
  {
    target: '[href="/admin/desk"]',
    title: 'The Desk',
    content: (
      <p>
        The Desk is your content management hub. View all articles, filter by status,
        and manage your content library. Use the status filters to find drafts, reviews,
        or published articles.
      </p>
    ),
  },
  {
    target: '[href="/admin/editor"]',
    title: 'The Editor',
    content: (
      <p>
        Create and edit articles with our powerful rich text editor. Use templates,
        preview your content, check SEO scores, and manage the approval workflow—all
        in one place.
      </p>
    ),
  },
  {
    target: '[href="/admin/media"]',
    title: 'Media Library',
    content: (
      <p>
        Upload and organize images in the Media Library. Add alt text, captions, and
        tags to make your media searchable and SEO-friendly. Use the media picker when
        editing articles.
      </p>
    ),
  },
  {
    target: '[href="/admin/analytics"]',
    title: 'Analytics',
    content: (
      <p>
        Track your content performance with detailed analytics. See page views, engagement
        metrics, traffic sources, and device breakdowns. Export reports for deeper analysis.
      </p>
    ),
  },
  {
    target: '[href="/admin/newsletter"]',
    title: 'Newsletter',
    content: (
      <p>
        Manage your newsletter subscribers and campaigns. Send automated emails when
        articles are published, or create custom campaigns to engage your audience.
      </p>
    ),
  },
]

interface WelcomeTourProps {
  userId?: string
  onComplete?: () => void
}

export function WelcomeTour({ userId, onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [user, setUser] = useState<string | undefined>(userId)

  // Move function definition up
  // Move function definition up
  const checkAndStartTour = useCallback((uid: string) => {
    if (!hasCompletedTour(uid)) {
      setIsActive(true)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    // Check if user has seen tour
    if (user) {
      setTimeout(() => checkAndStartTour(user), 0)
    } else {
      // If we don't have user yet, we might need to fetch
      supabase.auth.getUser().then(({ data }: { data: { user: any | null } }) => {
        if (data?.user) {
          setUser(data.user.id)
          // Defer tour start to allow render cycle to complete
          setTimeout(() => checkAndStartTour(data.user.id), 0)
        }
      })
    }
  }, [user, checkAndStartTour])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    if (user) {
      markTourCompleted(user)
    }
    setIsActive(false)
    if (onComplete) {
      onComplete()
    }
  }

  if (!isActive || currentStep >= tourSteps.length) {
    return null
  }

  const step = tourSteps[currentStep]

  return (
    <TourStep
      target={step.target}
      title={step.title}
      content={step.content}
      currentStep={currentStep + 1}
      totalSteps={tourSteps.length}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      onDismiss={handleComplete}
    />
  )
}





