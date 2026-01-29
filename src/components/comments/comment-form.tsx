'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment } from '@/app/actions/comments/create'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react'

interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CommentForm({ postId, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setIsAuthenticated(!!data?.user)
    })
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('মন্তব্য খালি রাখা যাবে না')
      return
    }

    if (content.length > 5000) {
      setError('মন্তব্য অনেক বড় (সর্বোচ্চ ৫০০০ অক্ষর)')
      return
    }

    setIsSubmitting(true)

    const result = await createComment(postId, content, parentId)

    if (result.success) {
      setContent('')
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } else {
      setError(result.error || 'মন্তব্য জমা দেওয়া সম্ভব হয়নি')
    }

    setIsSubmitting(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
        <p className="text-zinc-300 mb-3">মন্তব্য করতে আপনাকে লগইন করতে হবে।</p>
        <Button
          onClick={() => router.push('/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          লগইন
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? 'উত্তর লিখুন...' : 'মন্তব্য লিখুন...'}
        className="min-h-[100px] bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
        maxLength={5000}
      />
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          {content.length}/৫০০০ অক্ষর
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
            >
              বাতিল
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                জমা দেওয়া হচ্ছে...
              </>
            ) : (
              parentId ? 'উত্তর দিন' : 'মন্তব্য করুন'
            )}
          </Button>
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
          {error}
        </div>
      )}
      <p className="text-xs text-zinc-500">
        আপনার মন্তব্যটি প্রকাশের আগে সম্পাদক কর্তৃক যাচাই করা হবে।
      </p>
    </form>
  )
}





