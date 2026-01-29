'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Globe, Archive, Trash2, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'
import { submitToIndexNow } from '@/lib/indexnow'

type Post = Database['public']['Tables']['posts']['Row']

interface BulkActionsProps {
  selectedPosts: Post[]
  onClearSelection: () => void
}

export function BulkActions({ selectedPosts, onClearSelection }: BulkActionsProps) {
  const [confirmAction, setConfirmAction] = useState<'publish' | 'archive' | 'delete' | null>(null)
  const supabase = createClient()
  const queryClient = useQueryClient()

  const bulkMutation = useMutation({
    mutationFn: async ({
      postIds,
      action,
    }: {
      postIds: string[]
      action: 'publish' | 'archive' | 'delete'
    }) => {
      console.log('Bulk action:', action, 'Post IDs:', postIds)

      if (action === 'delete') {
        // Manual Cascade Delete:
        // The database prohibits deleting posts with existing analytics/comments.
        // We must delete the dependents first since we don't have ON DELETE CASCADE set up in SQL.

        // 1. Delete Analytics Events
        const { error: analyticsError } = await supabase
          .from('analytics_events')
          .delete()
          .in('post_id', postIds)

        if (analyticsError) {
          console.error('Error deleting analytics:', analyticsError)
          // Continue anyway, as it might just be empty
        }

        // 2. Delete Comments (if table exists and has data)
        const { error: commentsError } = await supabase
          .from('comments')
          .delete()
          .in('post_id', postIds)

        if (commentsError) {
          // Comments might not exist or verify, log but continue
          console.log('Note: Error deleting comments (might not exist):', commentsError.message)
        }

        // 3. Delete the Posts
        const { data, error } = await supabase
          .from('posts')
          .delete()
          .in('id', postIds)

        console.log('Delete result:', { data, error })
        if (error) {
          console.error('Delete error:', error)
          throw error
        }
      } else {
        const status = action === 'publish' ? 'published' : 'archived'
        const payload: any = { status }
        if (action === 'publish') {
          payload.published_at = new Date().toISOString()
        }

        // Return slugs for IndexNow (requires selecting them)
        // Since update doesn't return data by default easily without select(), we do it here:
        const { data, error } = await supabase
          .from('posts')
          .update(payload)
          .in('id', postIds)
          .select('slug')

        if (error) throw error
        return data || []
      }
    },
    onSuccess: (data, variables) => {
      console.log('Bulk action succeeded')

      // IndexNow Ping
      if (variables.action === 'publish' && data && Array.isArray(data)) {
        const urls = data.map((p: any) => `https://inshortbd.com/news/${p.slug}`)
        submitToIndexNow(urls).catch(console.error)
      }

      queryClient.invalidateQueries({ queryKey: ['posts'] })
      onClearSelection()
      setConfirmAction(null)
    },
    onError: (error) => {
      console.error('Bulk mutation error:', error)
      alert(`Error: ${error.message || 'Failed to perform action'}`)
    },
  })

  if (selectedPosts.length === 0) return null

  const handleBulkAction = (action: 'publish' | 'archive' | 'delete') => {
    setConfirmAction(action)
  }

  const confirmActionHandler = () => {
    if (!confirmAction) return
    bulkMutation.mutate({
      postIds: selectedPosts.map((p) => p.id),
      action: confirmAction,
    })
  }

  return (
    <>
      <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-md">
        <span className="text-sm text-muted-foreground">
          {selectedPosts.length} {selectedPosts.length === 1 ? 'post' : 'posts'} selected
        </span>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('publish')}
            disabled={bulkMutation.isPending}
          >
            <Globe className="h-4 w-4 mr-2" />
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('archive')}
            disabled={bulkMutation.isPending}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleBulkAction('delete')}
            disabled={bulkMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'delete' && 'Delete Posts'}
              {confirmAction === 'publish' && 'Publish Posts'}
              {confirmAction === 'archive' && 'Archive Posts'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'delete' &&
                `Are you sure you want to delete ${selectedPosts.length} post(s)? This action cannot be undone.`}
              {confirmAction === 'publish' &&
                `Publish ${selectedPosts.length} post(s) now? They will be immediately visible to readers.`}
              {confirmAction === 'archive' &&
                `Archive ${selectedPosts.length} post(s)? They will be hidden from public view.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmActionHandler}
              className={
                confirmAction === 'delete' ? 'bg-destructive text-destructive-foreground' : ''
              }
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
