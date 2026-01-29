import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

export interface AnalyticsData {
  totalViews: number
  totalArticles: number
  averageViews: number
  topArticles: Post[]
  categoryPerformance: {
    category: string
    count: number
    totalViews: number
    averageViews: number
  }[]
  authorPerformance: {
    authorId: string
    authorName: string | null
    articleCount: number
    totalViews: number
    averageViews: number
  }[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = await createClient()

  // Get all published posts with author info
  const { data: posts, error } = await (supabase
    .from('posts') as any)
    .select('*, author_id, profiles(full_name)')
    .eq('status', 'published')
    .order('views', { ascending: false })

  if (error || !posts) {
    return {
      totalViews: 0,
      totalArticles: 0,
      averageViews: 0,
      topArticles: [],
      categoryPerformance: [],
      authorPerformance: [],
    }
  }

  const typedPosts = (posts || []) as any[]
  const totalViews = typedPosts.reduce((sum: number, post: any) => sum + (post.views || 0), 0)
  const totalArticles = typedPosts.length
  const averageViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0

  // Top 10 articles
  const topArticles = typedPosts.slice(0, 10)

  // Category performance
  const categoryMap = new Map<string, { count: number; totalViews: number }>()
  
  typedPosts.forEach((post: any) => {
    const category = post.category || 'Uncategorized'
    const existing = categoryMap.get(category) || { count: 0, totalViews: 0 }
    categoryMap.set(category, {
      count: existing.count + 1,
      totalViews: existing.totalViews + (post.views || 0),
    })
  })

  const categoryPerformance = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    totalViews: data.totalViews,
    averageViews: data.count > 0 ? Math.round(data.totalViews / data.count) : 0,
  }))

  // Author performance
  const authorMap = new Map<string, { name: string | null; count: number; totalViews: number }>()
  
  typedPosts.forEach((post: any) => {
    if (post.author_id) {
      const authorName = (post.profiles as any)?.full_name || null
      const existing = authorMap.get(post.author_id) || { name: authorName, count: 0, totalViews: 0 }
      authorMap.set(post.author_id, {
        name: existing.name || authorName,
        count: existing.count + 1,
        totalViews: existing.totalViews + (post.views || 0),
      })
    }
  })

  const authorPerformance = Array.from(authorMap.entries()).map(([authorId, data]) => ({
    authorId,
    authorName: data.name,
    articleCount: data.count,
    totalViews: data.totalViews,
    averageViews: data.count > 0 ? Math.round(data.totalViews / data.count) : 0,
  }))

  return {
    totalViews,
    totalArticles,
    averageViews,
    topArticles: topArticles as Post[],
    categoryPerformance: categoryPerformance.sort((a, b) => b.totalViews - a.totalViews),
    authorPerformance: authorPerformance.sort((a, b) => b.totalViews - a.totalViews),
  }
}





