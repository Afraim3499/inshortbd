'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { moderateComment } from '@/app/actions/comments/moderate'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Check, X, AlertTriangle, RefreshCw } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam'

interface Comment {
  id: string
  post_id: string
  content: string
  status: CommentStatus
  created_at: string
  profiles: {
    full_name: string | null
    email: string | null
  } | null
  posts: {
    title: string
    slug: string
  } | null
}

function getStatusBadge(status: CommentStatus) {
  const variants: Record<CommentStatus, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    approved: { label: 'Approved', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    spam: { label: 'Spam', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  }
  const variant = variants[status]
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  )
}

export default function CommentsPage() {
  const [statusFilter, setStatusFilter] = useState<CommentStatus | 'all'>('all')
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: comments, isLoading, refetch } = useQuery({
    queryKey: ['comments', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('comments')
        .select('*, profiles(full_name, email), posts(title, slug)')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as Comment[]
    },
  })

  const handleModerate = async (commentId: string, status: CommentStatus) => {
    // Only allow moderation to approved, rejected, or spam (not pending)
    if (status === 'pending') {
      alert('Cannot set status to pending. Please choose approved, rejected, or spam.')
      return
    }
    const result = await moderateComment(commentId, status as 'approved' | 'rejected' | 'spam')
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      refetch()
    } else {
      alert(result.error || 'Failed to moderate comment')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Comment Moderation</h1>
          <p className="text-zinc-400 mt-1">Review and moderate reader comments</p>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CommentStatus | 'all')}>
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-zinc-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : !comments || comments.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No comments found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Comment</TableHead>
                <TableHead className="text-zinc-400">Author</TableHead>
                <TableHead className="text-zinc-400">Article</TableHead>
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id} className="border-zinc-800">
                  <TableCell className="max-w-md">
                    <div
                      className="text-sm text-zinc-300 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: comment.content.substring(0, 200) + (comment.content.length > 200 ? '...' : ''),
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {comment.profiles?.full_name || comment.profiles?.email || 'Anonymous'}
                  </TableCell>
                  <TableCell>
                    {comment.posts ? (
                      <Link
                        href={`/news/${comment.posts.slug}`}
                        className="text-blue-400 hover:text-blue-300 text-sm underline"
                        target="_blank"
                      >
                        {comment.posts.title}
                      </Link>
                    ) : (
                      <span className="text-zinc-500 text-sm">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{getStatusBadge(comment.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {comment.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleModerate(comment.id, 'approved')}
                          className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {comment.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleModerate(comment.id, 'rejected')}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {comment.status !== 'spam' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleModerate(comment.id, 'spam')}
                          className="h-8 w-8 p-0 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                          title="Mark as Spam"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}





