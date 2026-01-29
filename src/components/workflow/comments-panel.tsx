'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPostComments, type PostComment } from '@/app/actions/workflow/get-comments'
import { addComment } from '@/app/actions/workflow/add-comment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CommentsPanelProps {
  postId: string
}

function CommentItem({ comment, postId, onReply }: { comment: PostComment; postId: string; onReply: (parentId: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="border-l-2 border-border pl-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-sm">
              {comment.profiles?.full_name || 'Unknown User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id)}
            className="text-xs"
          >
            Reply
          </Button>
        </div>
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentsPanel({ postId }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => getPostComments(postId),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const result = await addComment(postId, newComment, replyingTo || undefined)
    if (result.success) {
      setNewComment('')
      setReplyingTo(null)
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] })
    } else {
      alert(result.error || 'Failed to add comment')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Start the conversation!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onReply={setReplyingTo}
              />
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {replyingTo && (
            <div className="flex items-center justify-between bg-accent/10 p-2 rounded text-xs">
              <span className="text-muted-foreground">Replying to comment</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          <Textarea
            placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" size="sm" disabled={!newComment.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {replyingTo ? 'Reply' : 'Comment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}






