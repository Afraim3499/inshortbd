'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSocialTask } from '@/app/actions/social/create-task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus } from 'lucide-react'

interface TaskCreatorProps {
  postId: string
  postTitle: string
  postSlug: string
  onSuccess?: () => void
}

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'other', label: 'Other' },
] as const

export function TaskCreator({ postId, postTitle, postSlug, onSuccess }: TaskCreatorProps) {
  const queryClient = useQueryClient()
  const [platform, setPlatform] = useState<'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'other'>('twitter')
  const [taskTitle, setTaskTitle] = useState(`Share: ${postTitle}`)
  const [taskDescription, setTaskDescription] = useState('')
  const [postText, setPostText] = useState('')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  const createMutation = useMutation({
    mutationFn: async () => {
      return await createSocialTask({
        postId,
        platform,
        taskTitle,
        taskDescription: taskDescription || undefined,
        postText: postText || undefined,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['social-task-kpi'] })
      if (onSuccess) onSuccess()
      // Reset form
      setTaskTitle(`Share: ${postTitle}`)
      setTaskDescription('')
      setPostText('')
      setAssignedTo('')
      setDueDate('')
      setPriority('medium')
    },
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <select
          id="platform"
          value={platform}
          onChange={(e) =>
            setPlatform(e.target.value as 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'other')
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taskTitle">Task Title</Label>
        <Input
          id="taskTitle"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Task title..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taskDescription">Description (Optional)</Label>
        <textarea
          id="taskDescription"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Task description or instructions..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="postText">Suggested Post Text (Optional)</Label>
        <textarea
          id="postText"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Suggested text for the social media post..."
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assign To (Optional)</Label>
          <Input
            id="assignedTo"
            type="email"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="User email or ID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date (Optional)</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {createMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'Failed to create task'}
          </AlertDescription>
        </Alert>
      )}

      {createMutation.isSuccess && (
        <Alert>
          <AlertDescription>Task created successfully!</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={() => createMutation.mutate()}
        disabled={createMutation.isPending || !taskTitle.trim()}
        className="w-full"
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </>
        )}
      </Button>
    </div>
  )
}






