'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { unsubscribeFromNewsletter } from '@/app/actions/newsletter/unsubscribe'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  async function handleUnsubscribe() {
    if (!token) {
      setStatus('error')
      setMessage('Invalid unsubscribe link')
      return
    }

    setStatus('loading')
    const result = await unsubscribeFromNewsletter(token)

    if (result.success) {
      setStatus('success')
      setMessage(result.message || 'Successfully unsubscribed')
    } else {
      setStatus('error')
      setMessage(result.error || 'Failed to unsubscribe')
    }
  }

  useEffect(() => {
    if (token && status === 'idle') {
      setTimeout(() => handleUnsubscribe(), 0)
    }
  }, [token])

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold mb-2">Unsubscribe</h1>
          <p className="text-muted-foreground">
            Manage your newsletter subscription
          </p>
        </div>

        {status === 'loading' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Processing your unsubscribe request...</AlertDescription>
          </Alert>
        )}

        {status === 'success' && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {!token && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid unsubscribe link. Please check your email for the correct link.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  )
}





