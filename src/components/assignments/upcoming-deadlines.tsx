'use client'

import { useQuery } from '@tanstack/react-query'
import { getAssignments } from '@/app/actions/assignments/get'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeadlineIndicator } from './deadline-indicator'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Clock, AlertTriangle } from 'lucide-react'

interface UpcomingDeadlinesProps {
  limit?: number
  userId?: string
}

export function UpcomingDeadlines({ limit = 5, userId }: UpcomingDeadlinesProps) {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['upcoming-deadlines', userId],
    queryFn: async () => {
      const filters: any = { status: 'pending' }
      if (userId) {
        filters.assigned_to = userId
      }
      const all = await getAssignments(filters)

      // Sort by deadline (soonest first) and filter to upcoming
      const now = new Date()
      return all
        .filter((a) => new Date(a.deadline) >= now)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, limit)
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-zinc-400">লোড করা হচ্ছে...</div>
        </CardContent>
      </Card>
    )
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-zinc-400">
            No upcoming deadlines
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-3 rounded-md bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              {assignment.posts ? (
                <Link
                  href={`/admin/editor?id=${assignment.posts.id}`}
                  className="block"
                >
                  <div className="font-medium text-zinc-50 mb-2 hover:text-blue-400 transition-colors">
                    {assignment.posts.title}
                  </div>
                </Link>
              ) : (
                <div className="font-medium text-zinc-50 mb-2">
                  Unknown Article
                </div>
              )}
              <DeadlineIndicator
                deadline={assignment.deadline}
                status={assignment.status}
                showIcon={false}
              />
              <div className="text-xs text-zinc-400 mt-1">
                Assigned to: {assignment.assigned_to_profile?.full_name || assignment.assigned_to_profile?.email || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}






