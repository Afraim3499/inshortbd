'use client'

import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import { getComments, type Comment } from '@/app/actions/comments/get'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface CommentListProps {
  postId: string
}

export function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadComments = async () => {
    setLoading(true)
    const data = await getComments(postId)
    setComments(data)
    setLoading(false)
  }

  useEffect(() => {
    setTimeout(() => loadComments(), 0)
  }, [postId, refreshKey])

  const handleCommentAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-4">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h2>
        <CommentForm postId={postId} onSuccess={handleCommentAdded} />
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={handleCommentAdded} />
          ))}
        </div>
      )}
    </div>
  )
}






