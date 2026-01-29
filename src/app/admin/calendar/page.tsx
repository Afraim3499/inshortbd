'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { publishScheduledPosts } from '@/app/actions/publish-scheduled'

type Value = Date | null

export default function EditorialCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Value>(new Date())
  const [isPublishing, setIsPublishing] = useState(false)
  const supabase = createClient()

  // Fetch all posts with their published_at dates
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['calendar-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, status, published_at, category')
        .order('published_at', { ascending: false, nullsFirst: false })

      if (error) throw error
      // Type assertion for posts query result
      return (data || []) as Array<{
        id: string
        title: string
        status: string
        published_at: string | null
        category: string | null
      }>
    },
  })

  // Group posts by date
  const postsByDate = posts?.reduce((acc, post: any) => {
    if (!post.published_at) return acc
    const date = new Date(post.published_at).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(post)
    return acc
  }, {} as Record<string, typeof posts>)

  // Get scheduled posts (draft with published_at in future)
  const scheduledPosts = posts?.filter((post: any) => {
    if (post.status !== 'draft' || !post.published_at) return false
    return new Date(post.published_at) > new Date()
  })

  // Get posts for selected date
  const selectedDatePosts =
    selectedDate && postsByDate
      ? postsByDate[selectedDate.toDateString()] || []
      : []

  // Mark dates with posts
  const tileClassName = ({ date }: { date: Date }) => {
    const dateString = date.toDateString()
    const hasPosts = (postsByDate?.[dateString]?.length ?? 0) > 0
    const hasScheduled = scheduledPosts?.some(
      (p: any) => p.published_at && new Date(p.published_at).toDateString() === dateString
    )
    
    if (hasScheduled) return 'bg-blue-500/20 border-2 border-blue-500'
    if (hasPosts) return 'bg-accent/20'
    return ''
  }

  const handlePublishScheduled = async () => {
    setIsPublishing(true)
    try {
      const result = await publishScheduledPosts()
      if (result.success) {
        refetch()
        alert(`Published ${result.published} scheduled post(s)`)
      }
    } catch (error) {
      console.error('Failed to publish scheduled posts:', error)
    } finally {
      setIsPublishing(false)
    }
  }

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
        <h1 className="text-3xl font-heading font-bold">Editorial Calendar</h1>
        {scheduledPosts && scheduledPosts.length > 0 && (
          <Button
            onClick={handlePublishScheduled}
            disabled={isPublishing}
            variant="outline"
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Publish Scheduled ({scheduledPosts.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value)
                  } else if (Array.isArray(value) && value[0] instanceof Date) {
                    setSelectedDate(value[0])
                  } else {
                    setSelectedDate(null)
                  }
                }}
                value={selectedDate}
                tileClassName={tileClassName}
                className="w-full border-none"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDatePosts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDatePosts.map((post: any) => (
                      <Link
                        key={post.id}
                        href={`/admin/editor?id=${post.id}`}
                        className="block p-3 rounded-md border border-border hover:bg-accent/10 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {post.title}
                          </h4>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post.category}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No posts scheduled for this date
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {scheduledPosts && scheduledPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scheduledPosts.slice(0, 5).map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/admin/editor?id=${post.id}`}
                      className="block p-3 rounded-md border border-border hover:bg-accent/10 transition-colors"
                    >
                      <h4 className="font-medium text-sm line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {post.published_at &&
                          new Date(post.published_at).toLocaleString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}





