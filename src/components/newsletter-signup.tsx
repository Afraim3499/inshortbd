'use client'

import { useState } from 'react'
import { subscribeToNewsletter } from '@/app/actions/newsletter/subscribe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface NewsletterSignupProps {
  variant?: 'default' | 'inline' | 'compact'
  source?: string
  className?: string
}

export function NewsletterSignup({
  variant = 'default',
  source = 'homepage',
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      setStatus('error')
      setMessage('অনুগ্রহ করে আপনার ইমেল ঠিকানা দিন')
      return
    }

    setStatus('loading')
    setMessage('')

    const result = await subscribeToNewsletter(email.trim(), name.trim() || undefined, source)

    if (result.success) {
      setStatus('success')
      setMessage(result.message || 'সফলভাবে সাবস্ক্রাইব করা হয়েছে!')
      setEmail('')
      setName('')
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } else {
      setStatus('error')
      setMessage(result.error || 'সাবস্ক্রাইব করা সম্ভব হয়নি। আবার চেষ্টা করুন।')
    }
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="ইমেল ঠিকানা"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'সাবস্ক্রাইব'
            )}
          </Button>
        </div>
        {status === 'success' && (
          <Alert className="mt-2">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-sm">{message}</AlertDescription>
          </Alert>
        )}
        {status === 'error' && (
          <Alert variant="destructive" className="mt-2">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{message}</AlertDescription>
          </Alert>
        )}
      </form>
    )
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="flex flex-col gap-2">
          {status === 'success' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-sm">{message}</AlertDescription>
            </Alert>
          )}
          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{message}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="আপনার ইমেল দিন"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'যোগ দিন'
              )}
            </Button>
          </div>
        </div>
      </form>
    )
  }

  // Default variant
  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="font-heading font-bold text-lg mb-2">ইনশর্ট ডেইলি</h3>
          <p className="text-sm text-muted-foreground mb-4">
            নিরপেক্ষ সংবাদ এবং বিশ্লেষণ সরাসরি আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।
          </p>
        </div>

        {status === 'success' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="নাম (ঐচ্ছিক)"
            aria-label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === 'loading'}
          />
          <Input
            type="email"
            placeholder="ইমেল ঠিকানা"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              সাবস্ক্রাইব করা হচ্ছে...
            </>
          ) : (
            'নিউজলেটার সাবস্ক্রাইব করুন'
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          আমরা আপনার গোপনীয়তাকে সম্মান করি। যেকোনো সময় আনসাবস্ক্রাইব করা যাবে।
        </p>
      </form>
    </div>
  )
}




