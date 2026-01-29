'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useSocialTasks } from '@/hooks/useSocialTasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/social/task-card'
import { Loader2 } from 'lucide-react'

export default function TaskBoardPage() {
  const supabase = createClient()
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  // Get current user
  useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
      return user
    },
  })

  // Fetch all tasks
  const { data: tasks, isLoading } = useSocialTasks({})

  const pendingTasks = tasks?.filter((t: any) => t.status === 'pending') || []
  const inProgressTasks = tasks?.filter((t: any) => t.status === 'in_progress') || []
  const completedTasks = tasks?.filter((t: any) => t.status === 'completed') || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Task Board</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending</span>
                <Badge variant="outline">{pendingTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} currentUserId={currentUserId} />
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending tasks
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* In Progress Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>In Progress</span>
                <Badge variant="secondary">{inProgressTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} currentUserId={currentUserId} />
              ))}
              {inProgressTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No in-progress tasks
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Completed Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Completed</span>
                <Badge variant="default">{completedTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedTasks.slice(0, 10).map((task) => (
                <TaskCard key={task.id} task={task} currentUserId={currentUserId} />
              ))}
              {completedTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No completed tasks
                </p>
              )}
              {completedTasks.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing 10 of {completedTasks.length} completed tasks
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

