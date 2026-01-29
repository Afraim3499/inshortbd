import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export async function getMostPopular(limit: number = 5) {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('posts') as any)
    .select('id, title, slug, views, featured_image_url, published_at')
    .eq('status', 'published')
    .not('views', 'is', null)
    .order('views', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching most popular posts:', error)
    return []
  }

  return (data || []) as Array<{
    id: string
    title: string
    slug: string
    views: number | null
    featured_image_url?: string
    published_at?: string
  }>
}

export async function MostPopular({ limit = 5 }: { limit?: number }) {
  const posts = await getMostPopular(limit)

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
        <span className="text-accent">🔥</span>
        সবচেয়ে জনপ্রিয়
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

