'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAssignmentByPost } from '@/app/actions/assignments/get'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeadlineIndicator } from './deadline-indicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit } from 'lucide-react'
import { AssignmentForm } from './assignment-form'
import { useUsers } from '@/hooks/useUsers'

interface AssignmentDisplayProps {
  postId: string
}

export function AssignmentDisplay({ postId }: AssignmentDisplayProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { data: users } = useUsers()

  const { data: assignment, isLoading, refetch } = useQuery({
    queryKey: ['assignment', postId],
    queryFn: () => getAssignmentByPost(postId),
  })

  const userOptions =
    users?.map((user) => ({
      id: user.id,
      name: user.full_name || user.email || 'Unknown User',
    })) || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-400">লোড করা হচ্ছে...</div>
        </CardContent>
      </Card>
    )
  }

  if (!assignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-400 mb-3">
            No assignment for this article
          </div>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-50 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
              </DialogHeader>
              <AssignmentForm
                postId={postId}
                assignedToOptions={userOptions}
                onSuccess={() => {
                  setEditDialogOpen(false)
                  refetch()
                }}
                onCancel={() => setEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assignment</CardTitle>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-50 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Assignment</DialogTitle>
              </DialogHeader>
              <AssignmentForm
                postId={postId}
                assignment={assignment}
                assignedToOptions={userOptions}
                onSuccess={() => {
                  setEditDialogOpen(false)
                  refetch()
                }}
                onCancel={() => setEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-zinc-400 mb-1">Assigned To</div>
          <div className="text-sm text-zinc-50">
            {assignment.assigned_to_profile?.full_name ||
              assignment.assigned_to_profile?.email ||
              'Unknown'}
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-400 mb-1">Deadline</div>
          <DeadlineIndicator
            deadline={assignment.deadline}
            status={assignment.status}
          />
        </div>

        <div>
          <div className="text-xs text-zinc-400 mb-1">Priority</div>
          <Badge
            variant={
              assignment.priority === 'high'
                ? 'destructive'
                : assignment.priority === 'medium'
                  ? 'default'
                  : 'outline'
            }
          >
            {assignment.priority}
          </Badge>
        </div>

        <div>
          <div className="text-xs text-zinc-400 mb-1">Status</div>
          <Badge
            variant={
              assignment.status === 'completed'
                ? 'default'
                : assignment.status === 'overdue'
                  ? 'destructive'
                  : assignment.status === 'in_progress'
                    ? 'secondary'
                    : 'outline'
            }
          >
            {assignment.status.replace('_', ' ')}
          </Badge>
        </div>

        {assignment.notes && (
          <div>
            <div className="text-xs text-zinc-400 mb-1">Notes</div>
            <div className="text-sm text-zinc-300">{assignment.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}






