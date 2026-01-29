'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAssignments, type Assignment } from '@/app/actions/assignments/get'
import { updateAssignment } from '@/app/actions/assignments/update'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeadlineIndicator } from '@/components/assignments/deadline-indicator'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'

const columns = [
  { id: 'pending', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
  { id: 'overdue', title: 'Overdue' },
] as const

type ColumnId = typeof columns[number]['id']

export default function AssignmentsBoardPage() {
  const queryClient = useQueryClient()

  const { data: assignments, isLoading, refetch } = useQuery({
    queryKey: ['assignments-board'],
    queryFn: async () => {
      return await getAssignments()
    },
  })

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !assignments) return

    const assignmentId = result.draggableId
    const newStatus = result.destination.droppableId as ColumnId

    // Optimistically update UI
    queryClient.setQueryData(['assignments-board'], (old: Assignment[] | undefined) => {
      if (!old) return old
      return old.map((a) =>
        a.id === assignmentId ? { ...a, status: newStatus } : a
      )
    })

    // Update in database
    const result_action = await updateAssignment(assignmentId, { status: newStatus })
    if (!result_action.success) {
      // Revert on error
      refetch()
    }
  }

  const getAssignmentsForColumn = (columnId: ColumnId): Assignment[] => {
    if (!assignments) return []
    return assignments.filter((a) => a.status === columnId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Task Board</h1>
        <p className="text-zinc-400 mt-1">Drag and drop to update assignment status</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    rounded-lg border-2 p-4 min-h-[500px]
                    ${snapshot.isDraggingOver ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50'}
                  `}
                >
                  <h2 className="text-lg font-semibold mb-4 text-zinc-50">
                    {column.title}
                    <span className="ml-2 text-sm text-zinc-400">
                      ({getAssignmentsForColumn(column.id).length})
                    </span>
                  </h2>

                  <div className="space-y-3">
                    {getAssignmentsForColumn(column.id).map((assignment, index) => (
                      <Draggable
                        key={assignment.id}
                        draggableId={assignment.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              bg-zinc-800 border-zinc-700
                              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}
                            `}
                          >
                            <CardContent className="p-4 space-y-3">
                              {assignment.posts ? (
                                <Link
                                  href={`/admin/editor?id=${assignment.posts.id}`}
                                  className="block"
                                >
                                  <h3 className="font-medium text-zinc-50 hover:text-blue-400 transition-colors line-clamp-2">
                                    {assignment.posts.title}
                                  </h3>
                                </Link>
                              ) : (
                                <h3 className="font-medium text-zinc-50">
                                  Unknown Article
                                </h3>
                              )}

                              <DeadlineIndicator
                                deadline={assignment.deadline}
                                status={assignment.status}
                                showIcon={false}
                              />

                              <div className="flex items-center justify-between">
                                <Badge
                                  variant={
                                    assignment.priority === 'high'
                                      ? 'destructive'
                                      : assignment.priority === 'medium'
                                      ? 'default'
                                      : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {assignment.priority}
                                </Badge>
                                <span className="text-xs text-zinc-400">
                                  {assignment.assigned_to_profile?.full_name ||
                                    assignment.assigned_to_profile?.email ||
                                    'Unknown'}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}






