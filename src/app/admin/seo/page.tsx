'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, FileText, Search, BarChart3 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

export default function SEODashboardPage() {
  const supabase = createClient()

  // Fetch all published posts with SEO scores
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['posts-seo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, seo_score, readability_score, views, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return (data || []) as Array<{
        id: string
        title: string
        slug: string
        seo_score: number | null
        readability_score: number | null
        views: number | null
        published_at: string | null
      }>
    },
  })

  // Calculate overall SEO health
  const overallHealth = posts
    ? {
        averageScore: Math.round(
          (posts.filter((p: any) => p.seo_score).reduce((sum: number, p: any) => sum + (p.seo_score || 0), 0) /
            Math.max(posts.filter((p: any) => p.seo_score).length, 1)) * 10
        ) / 10,
        totalArticles: posts.length,
        articlesWithScore: posts.filter((p: any) => p.seo_score).length,
        excellentCount: posts.filter((p: any) => (p.seo_score || 0) >= 80).length,
        goodCount: posts.filter((p: any) => (p.seo_score || 0) >= 60 && (p.seo_score || 0) < 80).length,
        needsImprovement: posts.filter((p: any) => (p.seo_score || 0) < 60).length,
      }
    : null

  if (isLoadingPosts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">SEO Dashboard</h1>
      </div>

      {/* Overall Health Cards */}
      {overallHealth && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average SEO Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallHealth.averageScore}</div>
              <p className="text-xs text-muted-foreground mt-1">/ 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallHealth.totalArticles}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {overallHealth.articlesWithScore} analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excellent (80+)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{overallHealth.excellentCount}</div>
              <p className="text-xs text-muted-foreground mt-1">articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
              <Search className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {overallHealth.needsImprovement}
              </div>
              <p className="text-xs text-muted-foreground mt-1">articles</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Article SEO Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {posts && posts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>SEO Score</TableHead>
                    <TableHead>Readability</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => {
                    const seoScore = post.seo_score || 0
                    const scoreColor =
                      seoScore >= 80
                        ? 'text-green-500'
                        : seoScore >= 60
                          ? 'text-yellow-500'
                          : 'text-red-500'

                    const scoreBadge =
                      seoScore >= 80
                        ? 'default'
                        : seoScore >= 60
                          ? 'secondary'
                          : 'destructive'

                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/editor?id=${post.id}`}
                            className="hover:underline"
                          >
                            {post.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {post.seo_score !== null ? (
                            <Badge variant={scoreBadge}>
                              <span className={scoreColor}>{seoScore}</span>
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not analyzed</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {post.readability_score !== null ? (
                            <Badge variant="outline">{post.readability_score}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{post.views || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/editor?id=${post.id}`}
                            className="text-sm text-accent hover:underline"
                          >
                            Edit
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No articles found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





