'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Eye,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  Edit,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { UpcomingDeadlines } from '@/components/assignments/upcoming-deadlines'
import { ContentRunTracker } from '@/components/dashboard/content-run-tracker'

export default function AdminDashboardPage() {
  const supabase = createClient()

  // Fetch dashboard stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [postsRes, viewsRes] = await Promise.all([
        supabase.from('posts').select('status, views'),
        supabase
          .from('posts')
          .select('views')
          .eq('status', 'published')
          .not('views', 'is', null),
      ])

      const posts = (postsRes.data || []) as Array<{ status: string; views: number | null }>
      const publishedPosts = posts.filter((p: any) => p.status === 'published')
      const draftPosts = posts.filter((p: any) => p.status === 'draft')
      const totalViews = (viewsRes.data || []).reduce((sum: number, p: any) => sum + (p.views || 0), 0)

      return {
        totalPosts: posts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalViews,
        averageViews: publishedPosts.length > 0 ? Math.round(totalViews / publishedPosts.length) : 0,
      }
    },
  })

  // Fetch recent posts
  const { data: recentPosts, isLoading: loadingRecent } = useQuery({
    queryKey: ['admin-dashboard-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, status, published_at, created_at, views')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return (data || []) as Array<{
        id: string
        title: string
        status: string
        published_at: string | null
        created_at: string
        views: number | null
      }>
    },
  })

  // Fetch scheduled posts
  const { data: scheduledPosts, isLoading: loadingScheduled } = useQuery({
    queryKey: ['admin-dashboard-scheduled'],
    queryFn: async () => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, published_at, status')
        .eq('status', 'draft')
        .not('published_at', 'is', null)
        .gt('published_at', now)
        .order('published_at', { ascending: true })
        .limit(5)

      if (error) throw error
      return (data || []) as Array<{
        id: string
        title: string
        published_at: string | null
        status: string
      }>
    },
  })

  if (loadingStats || loadingRecent || loadingScheduled) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/categories">
            <Button variant="outline">
              Manage Categories
            </Button>
          </Link>
          <Link href="/admin/editor">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.publishedPosts || 0} published, {stats?.draftPosts || 0} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalViews.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {stats?.averageViews.toLocaleString() || '0'} per article
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledPosts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Posts scheduled for future
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.publishedPosts || 0 > 0
                ? Math.round(((stats?.publishedPosts || 0) / (stats?.totalPosts || 1)) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Published ratio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-md border border-border hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/editor?id=${post.id}`}
                        className="font-medium hover:text-accent transition-colors block truncate"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            post.status === 'published'
                              ? 'default'
                              : post.status === 'archived'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {post.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {post.views !== null && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {post.views} views
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link href={`/admin/editor?id=${post.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No posts yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Scheduled */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledPosts && scheduledPosts.length > 0 ? (
              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-md border border-border hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/editor?id=${post.id}`}
                        className="font-medium hover:text-accent transition-colors block truncate"
                      >
                        {post.title}
                      </Link>
                      {post.published_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(post.published_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Link href={`/admin/editor?id=${post.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No posts scheduled. Create and schedule one!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines & Content Run Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingDeadlines limit={5} />
        </div>
        <div className="lg:col-span-1">
          <ContentRunTracker />
        </div>
      </div>
    </div>
  )
}

