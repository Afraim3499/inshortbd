'use client'
// Force rebuild: Fix client manifest error

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <h2 className="text-xl font-bold text-red-600">Admin System Error</h2>
      <p className="text-gray-600">{error.message || "Something went wrong."}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
