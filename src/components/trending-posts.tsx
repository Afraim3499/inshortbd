import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

interface TrendingPostsProps {
  excludeIds?: string[]
  limit?: number
}

/**
 * Calculates trending score based on:
 * - Views (weighted)
 * - Recency (more recent = higher score)
 * - Formula: views_score * 0.6 + recency_score * 0.4
 */
export async function getTrendingPosts(
  excludeIds: string[] = [],
  limit: number = 5
) {
  const supabase = await createClient()

  // Get posts from last 7 days with views
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  let query = (supabase
    .from('posts') as any)
    .select('id, title, slug, views, published_at')
    .eq('status', 'published')
    .gte('published_at', sevenDaysAgo.toISOString())
    .not('views', 'is', null)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error || !data) {
    // Only log if there's a meaningful error (not from mock client during build/dev)
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching trending posts:', error)
    }
    return []
  }

  // Calculate trending scores
  const typedData = (data || []) as any[]
  const now = Date.now()
  const maxViews = Math.max(...typedData.map((p: any) => p.views || 0), 1)

  const postsWithScores = typedData.map((post: any) => {
    const publishedTime = new Date(post.published_at || 0).getTime()
    const ageInHours = (now - publishedTime) / (1000 * 60 * 60)

    // Views score (0-1) - logarithmic scale to prevent super popular from dominating
    const viewsScore = Math.log10((post.views || 0) + 1) / Math.log10(maxViews + 1)

    // Recency score (0-1) - newer = higher score, decays over 7 days
    const recencyScore = Math.max(0, 1 - ageInHours / (7 * 24))

    // Combined score (60% views, 40% recency)
    const trendingScore = viewsScore * 0.6 + recencyScore * 0.4

    return {
      ...post,
      trendingScore,
    }
  })

  // Sort by trending score and return top N
  return postsWithScores
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)
}

export async function TrendingPosts({ excludeIds = [], limit = 5 }: TrendingPostsProps) {
  const posts = await getTrendingPosts(excludeIds, limit)

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
        আলোচিত
      </h3>
      <div className="space-y-4">
        {posts.map((post: any, index) => (
          <Link
            key={post.id}
            href={`/news/${post.slug}`}
            className="group block"
          >
            <div className="flex items-start gap-2">
              <div className="text-xs font-mono text-muted-foreground min-w-[20px]">
                {(index + 1).toLocaleString('bn-BD').padStart(2, '০')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium group-hover:text-accent transition-colors text-sm line-clamp-2">
                  {post.title}
                </div>
                {/* {post.views !== null && (
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {post.views.toLocaleString('bn-BD')} বার পঠিত
                  </div>
                )} */}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

