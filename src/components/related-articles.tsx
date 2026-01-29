'use client'

import { createClient } from '@/utils/supabase/client'
import { NewsImage } from '@/components/news-image'
import Link from 'next/link'
import { Database } from '@/types/database.types'
import { useEffect, useState } from 'react'

type Post = Database['public']['Tables']['posts']['Row']

interface RelatedArticlesProps {
  currentPostId: string
  category: string
  currentTags?: string[] | null
  limit?: number
}

export function RelatedArticles({
  currentPostId,
  category,
  currentTags = [],
  limit = 3,
}: RelatedArticlesProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelated() {
      const supabase = createClient()

      // First, get posts in same category
      const { data: categoryPosts } = await (supabase
        .from('posts') as any)
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .neq('id', currentPostId)
        .limit(limit * 3)

      // Also get posts with matching tags if we have tags
      let taggedPosts: any[] = []
      if (currentTags && currentTags.length > 0) {
        const { data } = await (supabase
          .from('posts') as any)
          .select('*')
          .eq('status', 'published')
          .neq('id', currentPostId)
          .contains('tags', currentTags)
          .limit(limit * 2)

        if (data) {
          taggedPosts = (data || []) as any[]
        }
      }

      // Combine and score posts
      const allPosts = [...((categoryPosts || []) as any[]), ...taggedPosts]

      // Deduplicate by ID
      const uniquePosts = Array.from(
        new Map(allPosts.map((post: any) => [post.id, post])).values()
      )

      // Score posts: higher score = more relevant
      const scoredPosts = uniquePosts.map((post: any) => {
        let score = 0

        // Category match: +10 points
        if (post.category === category) {
          score += 10
        }

        // Tag matches: +5 points per matching tag
        if (currentTags && post.tags && Array.isArray(post.tags)) {
          const matchingTags = post.tags.filter((tag: any) =>
            currentTags.includes(tag)
          ).length
          score += matchingTags * 5
        }

        // Recency: newer posts get slight boost
        if (post.published_at) {
          const pubDate = new Date(post.published_at).getTime()
          const now = Date.now()
          const daysSince = (now - pubDate) / (1000 * 60 * 60 * 24)
          if (daysSince < 7) score += 2
          else if (daysSince < 30) score += 1
        }

        return { ...post, relevanceScore: score }
      })

      // Sort by relevance score and take top N
      const topPosts = scoredPosts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

      setPosts(topPosts)
      setLoading(false)
    }

    fetchRelated()
  }, [currentPostId, category, currentTags, limit])

  if (loading) {
    // Optional Skeleton? For now returning null to avoid layout shift jerkiness or simple blank
    return null
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="border-t border-border pt-8 mt-8">
      <h2 className="text-2xl font-heading font-bold mb-6">Related Articles</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post: any) => (
          <Link
            key={post.id}
            href={`/news/${post.slug}`}
            className="group block space-y-3"
          >
            <div className="aspect-video rounded-md border border-border/50 overflow-hidden relative">
              <NewsImage
                src={post.featured_image_url}
                alt={post.title}
                fill
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="text-accent uppercase">{post.category}</span>
                {post.published_at && (
                  <>
                    <span>•</span>
                    <span suppressHydrationWarning>{new Date(post.published_at).toLocaleDateString()}</span>
                  </>
                )}
              </div>
              <h3 className="font-heading font-bold group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}




