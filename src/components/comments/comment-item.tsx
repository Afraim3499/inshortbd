'use client'

import { formatDistanceToNow } from 'date-fns'
import { Reply, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { CommentForm } from './comment-form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { Comment } from '@/app/actions/comments/get'
import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CommentItemProps {
  comment: Comment
  onReply?: () => void
}

export function CommentItem({ comment, onReply }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setCurrentUserId(data.user?.id || null)
    })
  }, [supabase])

  const authorName = comment.profiles?.full_name || comment.profiles?.email || 'Anonymous'
  const isOwnComment = currentUserId === comment.user_id

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium">
            {authorName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-50">{authorName}</span>
                {isOwnComment && (
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                    You
                  </span>
                )}
              </div>
              <time className="text-xs text-zinc-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </time>
            </div>
          </div>
          <div
            className="text-zinc-300 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-zinc-400 hover:text-zinc-50 h-8"
            >
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-13 border-l-2 border-zinc-800 pl-4">
          <CommentForm
            postId={comment.post_id}
            parentId={comment.id}
            onSuccess={() => {
              setShowReplyForm(false)
              router.refresh()
              if (onReply) onReply()
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-13 space-y-3 border-l-2 border-zinc-800 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  )
}





