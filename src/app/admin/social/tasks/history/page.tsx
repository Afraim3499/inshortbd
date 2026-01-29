'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useSocialTasks } from '@/hooks/useSocialTasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

export default function TaskHistoryPage() {
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch completed tasks
  const { data: tasks, isLoading } = useSocialTasks({
    status: 'completed',
  })

  // Filter by search
  const filteredTasks =
    tasks?.filter(
      (task) =>
        !searchQuery.trim() ||
        task.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.post?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assigned_to_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

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
        <h1 className="text-3xl font-heading font-bold">Task History</h1>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search completed tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Completed Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Completion Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const latestCompletion = task.completions?.[task.completions.length - 1]
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.task_title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {task.platform}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.assigned_to_profile?.full_name || task.assigned_to_profile?.email || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          {task.post ? (
                            <Link
                              href={`/news/${task.post.slug}`}
                              target="_blank"
                              className="text-accent hover:underline inline-flex items-center gap-1"
                            >
                              {task.post.title}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {latestCompletion
                            ? new Date(latestCompletion.completed_at).toLocaleDateString()
                            : new Date(task.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {latestCompletion?.completion_link ? (
                            <a
                              href={latestCompletion.completion_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline inline-flex items-center gap-1 text-sm"
                            >
                              View Post
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No completed tasks found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}






