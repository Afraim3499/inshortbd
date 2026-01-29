'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  className?: string
  showCounts?: boolean
}

interface ShareCounts {
  twitter: number | null
  facebook: number | null
  linkedin: number | null
  total: number
}

/**
 * Get share counts for a URL
 * Note: Real implementations would use APIs like:
 * - Twitter API (requires auth)
 * - Facebook Graph API
 * - LinkedIn API
 * For now, we'll use mock data or localStorage-based tracking
 */
async function getShareCounts(url: string): Promise<ShareCounts> {
  // Mock implementation - in production, fetch from APIs
  // For now, we'll track shares in localStorage as a simple solution

  if (typeof window === 'undefined') {
    return { twitter: null, facebook: null, linkedin: null, total: 0 }
  }

  try {
    const stored = localStorage.getItem(`shares_${url}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        twitter: parsed.twitter || 0,
        facebook: parsed.facebook || 0,
        linkedin: parsed.linkedin || 0,
        total: (parsed.twitter || 0) + (parsed.facebook || 0) + (parsed.linkedin || 0),
      }
    }
  } catch {
    // Ignore errors
  }

  return { twitter: null, facebook: null, linkedin: null, total: 0 }
}

function incrementShareCount(url: string, platform: 'twitter' | 'facebook' | 'linkedin' | 'native' | 'other') {
  if (typeof window === 'undefined') return

  try {
    const key = `shares_${url}`
    const stored = localStorage.getItem(key)
    const counts = stored ? JSON.parse(stored) : { twitter: 0, facebook: 0, linkedin: 0 }
    counts[platform] = (counts[platform] || 0) + 1
    localStorage.setItem(key, JSON.stringify(counts))
  } catch {
    // Ignore errors
  }
}

export function SocialShare({
  url,
  title,
  description,
  className,
  showCounts = true,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [shareCounts, setShareCounts] = useState<ShareCounts>({
    twitter: null,
    facebook: null,
    linkedin: null,
    total: 0,
  })

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
  const shareText = description ? `${title} - ${description}` : title

  useEffect(() => {
    if (showCounts) {
      getShareCounts(fullUrl).then(setShareCounts)
    }
  }, [fullUrl, showCounts])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'native', shareUrl?: string) => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (platform === 'native') {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title,
            text: description,
            url: fullUrl,
          });
          incrementShareCount(fullUrl, 'other'); // Track native shares
          return;
        } catch (err) {
          console.warn('Native share failed:', err);
          // Fallback handled by UI state (showing buttons)
        }
      }
      return;
    }

    if (shareUrl) {
      incrementShareCount(fullUrl, platform)
      getShareCounts(fullUrl).then(setShareCounts)
      window.open(shareUrl, '_blank', 'width=550,height=420')
    }
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
  }

  // Check for native share support using useSyncExternalStore (Hydration safe)
  const canNativeShare = useSyncExternalStore(
    () => () => { }, // Subscribe (no-op as navigator doesn't emit events)
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function', // Client Snapshot
    () => false // Server Snapshot
  )

  if (canNativeShare) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <Button
          onClick={() => handleShare('native')}
          className="w-full bg-primary text-white hover:bg-primary-dark"
        >
          <Link2 className="h-4 w-4 mr-2" />
          শেয়ার করুন
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter', shareLinks.twitter)}
          className="hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          <Twitter className="h-4 w-4 mr-2" />
          টুইটার
          {showCounts && shareCounts.twitter !== null && shareCounts.twitter > 0 && (
            <span className="ml-2 text-xs">({shareCounts.twitter})</span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook', shareLinks.facebook)}
          className="hover:bg-blue-600 hover:text-white hover:border-blue-600"
        >
          <Facebook className="h-4 w-4 mr-2" />
          ফেসবুক
          {showCounts && shareCounts.facebook !== null && shareCounts.facebook > 0 && (
            <span className="ml-2 text-xs">({shareCounts.facebook})</span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin', shareLinks.linkedin)}
          className="hover:bg-blue-700 hover:text-white hover:border-blue-700"
        >
          <Linkedin className="h-4 w-4 mr-2" />
          লিঙ্কডইন
          {showCounts && shareCounts.linkedin !== null && shareCounts.linkedin > 0 && (
            <span className="ml-2 text-xs">({shareCounts.linkedin})</span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="hover:bg-accent"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              কপি হয়েছে!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4 mr-2" />
              লিংক কপি করুন
            </>
          )}
        </Button>
      </div>
      {showCounts && shareCounts.total > 0 && (
        <p className="text-xs text-muted-foreground font-mono">
          {shareCounts.total} বার শেয়ার হয়েছে
        </p>
      )}
    </div>
  )
}



