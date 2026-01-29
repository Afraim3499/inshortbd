import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export async function BreakingBanner() {
  const supabase = await createClient()

  // Fetch latest 5 posts
  const { data: posts, error } = await (supabase
    .from('posts') as any)
    .select('title, slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)

  if (error || !posts || posts.length === 0) {
    return null
  }

  // Double the posts for seamless looping
  const tickerItems = [...posts, ...posts, ...posts]

  return (
    <div className="relative w-full bg-soft-wash border-b border-card-border overflow-hidden z-[100] h-10 flex items-center">
      {/* Fixed Sticky Label */}
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-soft-wash z-10 flex items-center shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
        <span className="flex items-center gap-2 text-alert-red font-bold text-xs sm:text-sm whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-alert-red"></span>
          </span>
          সদ্যপ্রাপ্ত:
        </span>
      </div>

      {/* Marquee Container */}
      <div className="flex-1 ml-24 sm:ml-28 overflow-hidden">
        <div className="animate-marquee hover-pause py-2 flex items-center">
          {tickerItems.map((post, idx) => (
            <Link
              key={`${post.slug}-${idx}`}
              href={`/news/${post.slug}`}
              className="inline-flex items-center group mx-4 whitespace-nowrap"
            >
              <span className="text-sm sm:text-base font-medium text-ink-black group-hover:text-alert-red transition-colors">
                {post.title}
              </span>
              <span className="mx-6 text-alert-red opacity-50 font-bold">🔴</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
