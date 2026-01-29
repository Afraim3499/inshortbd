'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeSocialTask } from '@/app/actions/social/complete-task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, ExternalLink, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database.types'

type SocialTask = Database['public']['Tables']['social_tasks']['Row'] & {
  post?: {
    id: string
    title: string
    slug: string
  } | null
  assigned_to_profile?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  assigned_by_profile?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

interface TaskCardProps {
  task: SocialTask
  currentUserId?: string
}

export function TaskCard({ task, currentUserId }: TaskCardProps) {
  const queryClient = useQueryClient()
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [completionLink, setCompletionLink] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')

  const completeMutation = useMutation({
    mutationFn: async () => {
      return await completeSocialTask(task.id, completionLink, completionNotes)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['social-task-kpi'] })
      setShowCompleteForm(false)
      setCompletionLink('')
      setCompletionNotes('')
    },
  })

  const canComplete = task.status !== 'completed' && (task.assigned_to === currentUserId || !task.assigned_to)
  const priorityColors = {
    low: 'secondary',
    medium: 'default',
    high: 'destructive',
    urgent: 'destructive',
  } as const

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
            <Badge variant="outline">{task.platform}</Badge>
            <Badge
              variant={
                task.status === 'completed'
                  ? 'default'
                  : task.status === 'in_progress'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {task.status}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg">{task.task_title}</h3>
          {task.task_description && (
            <p className="text-sm text-muted-foreground mt-1">{task.task_description}</p>
          )}
        </div>
      </div>

      {task.post && (
        <div className="text-sm">
          <span className="text-muted-foreground">Article: </span>
          <Link
            href={`/news/${task.post.slug}`}
            target="_blank"
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            {task.post.title}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {task.article_url && (
        <div className="text-sm">
          <a
            href={task.article_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            নিবন্ধটি দেখুন
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {task.assigned_to_profile && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{task.assigned_to_profile.full_name || task.assigned_to_profile.email}</span>
          </div>
        )}
        {task.due_date && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>শেষ সময়: {new Date(task.due_date).toLocaleDateString('bn-BD')}</span>
          </div>
        )}
      </div>

      {task.post_text && (
        <div className="bg-muted/50 rounded p-3 text-sm">
          <p className="font-medium mb-1">প্রস্তাবিত পোস্ট টেক্সট:</p>
          <p className="text-muted-foreground">{task.post_text}</p>
        </div>
      )}

      {showCompleteForm ? (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="space-y-2">
            <Label htmlFor="completionLink">সম্পন্ন হওয়ার লিংক *</Label>
            <Input
              id="completionLink"
              type="url"
              value={completionLink}
              onChange={(e) => setCompletionLink(e.target.value)}
              placeholder="লিংক দিন"
              required
            />
            <p className="text-xs text-muted-foreground">
              প্রমাণ হিসেবে আপনার সোশ্যাল মিডিয়া পোস্টের ইউআরএল পেস্ট করুন
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionNotes">নোট (ঐচ্ছিক)</Label>
            <textarea
              id="completionNotes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="অতিরিক্ত কোনো নোট..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {completeMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {completeMutation.error instanceof Error
                  ? completeMutation.error.message
                  : 'Failed to complete task'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending || !completionLink.trim()}
              className="flex-1"
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  জমা দেওয়া হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  কাজ সম্পন্ন করুন
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCompleteForm(false)
                setCompletionLink('')
                setCompletionNotes('')
              }}
              disabled={completeMutation.isPending}
            >
              বাতিল
            </Button>
          </div>
        </div>
      ) : (
        canComplete && (
          <Button
            onClick={() => setShowCompleteForm(true)}
            variant="outline"
            className="w-full"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            সম্পন্ন হিসেবে চিহ্নিত করুন
          </Button>
        )
      )}

      {task.status === 'completed' && (
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            সম্পন্ন হয়েছে <span suppressHydrationWarning>{new Date(task.updated_at).toLocaleDateString('bn-BD')}</span>
          </p>
        </div>
      )}
    </div>
  )
}






