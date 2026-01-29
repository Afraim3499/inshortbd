'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAssignments, type Assignment } from '@/app/actions/assignments/get'
import { updateAssignment } from '@/app/actions/assignments/update'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DeadlineIndicator } from '@/components/assignments/deadline-indicator'
import { AssignmentForm } from '@/components/assignments/assignment-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit, Check, X, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useUsers } from '@/hooks/useUsers'
import { formatDistanceToNow } from 'date-fns'

export default function AssignmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: assignments, isLoading, refetch } = useQuery({
    queryKey: ['assignments', statusFilter, priorityFilter, assignedToFilter],
    queryFn: async () => {
      const filters: any = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      if (priorityFilter !== 'all') filters.priority = priorityFilter
      if (assignedToFilter !== 'all') filters.assigned_to = assignedToFilter
      return await getAssignments(filters)
    },
  })

  const { data: users } = useUsers()

  const handleStatusUpdate = async (assignmentId: string, newStatus: Assignment['status']) => {
    const result = await updateAssignment(assignmentId, { status: newStatus })
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      refetch()
    } else {
      alert(result.error || 'Failed to update assignment')
    }
  }

  const userOptions =
    users?.map((user) => ({
      id: user.id,
      name: user.full_name || user.email || 'Unknown User',
    })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Content Assignments</h1>
          <p className="text-zinc-400 mt-1">Track article assignments and deadlines</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/assignments/board">
            <Button variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700">
              Kanban Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-zinc-50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-zinc-50">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-zinc-50">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">All Users</SelectItem>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : !assignments || assignments.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No assignments found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Article</TableHead>
                <TableHead className="text-zinc-400">Assigned To</TableHead>
                <TableHead className="text-zinc-400">Deadline</TableHead>
                <TableHead className="text-zinc-400">Priority</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="border-zinc-800">
                  <TableCell>
                    {assignment.posts ? (
                      <Link
                        href={`/admin/editor?id=${assignment.posts.id}`}
                        className="font-medium text-blue-400 hover:text-blue-300 underline"
                      >
                        {assignment.posts.title}
                      </Link>
                    ) : (
                      <span className="text-zinc-500">Unknown Article</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {assignment.assigned_to_profile?.full_name ||
                      assignment.assigned_to_profile?.email ||
                      'Unknown'}
                  </TableCell>
                  <TableCell>
                    <DeadlineIndicator
                      deadline={assignment.deadline}
                      status={assignment.status}
                    />
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {assignment.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleStatusUpdate(assignment.id, 'completed')
                          }
                          className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          title="Mark Complete"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAssignment(assignment)
                          setFormDialogOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {assignment.posts && (
                        <Link
                          href={`/news/${assignment.posts.slug}`}
                          target="_blank"
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-50 inline-flex items-center justify-center"
                          title="View Article"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Assignment Dialog */}
      {selectedAssignment && (
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-50 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
            </DialogHeader>
            <AssignmentForm
              postId={selectedAssignment.post_id}
              assignment={selectedAssignment}
              assignedToOptions={userOptions}
              onSuccess={() => {
                setFormDialogOpen(false)
                setSelectedAssignment(null)
                refetch()
              }}
              onCancel={() => {
                setFormDialogOpen(false)
                setSelectedAssignment(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}






