'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { approvePost } from '@/app/actions/workflow/approve-post'
import { rejectPost } from '@/app/actions/workflow/reject-post'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface ApprovalActionsProps {
  postId: string
  currentStatus: string
  onStatusChange?: () => void
}

export function ApprovalActions({
  postId,
  currentStatus,
  onStatusChange,
}: ApprovalActionsProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const canApprove = currentStatus === 'review'
  const canReject = currentStatus === 'review'

  const handleApprove = async () => {
    setLoading(true)
    const result = await approvePost(postId, comment || undefined)
    setLoading(false)

    if (result.success) {
      setShowApproveDialog(false)
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      onStatusChange?.()
    } else {
      alert(result.error || 'Failed to approve post')
    }
  }

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setLoading(true)
    const result = await rejectPost(postId, comment)
    setLoading(false)

    if (result.success) {
      setShowRejectDialog(false)
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      onStatusChange?.()
    } else {
      alert(result.error || 'Failed to reject post')
    }
  }

  if (!canApprove && !canReject) {
    return null
  }

  return (
    <>
      <div className="flex gap-2">
        {canReject && (
          <Button
            variant="destructive"
            onClick={() => setShowRejectDialog(true)}
            className="flex-1"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        )}
        {canApprove && (
          <Button
            onClick={() => setShowApproveDialog(true)}
            className="flex-1"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </Button>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Article</DialogTitle>
            <DialogDescription>
              Approve this article for publishing. You can optionally add a comment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Optional comment (e.g., 'Great work! Ready to publish.')"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false)
                setComment('')
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Article</DialogTitle>
            <DialogDescription>
              Reject this article and return it to draft. Please provide feedback for the author.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for rejection (required)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setComment('')
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading || !comment.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}






