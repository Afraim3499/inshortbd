import { createClient } from '@/utils/supabase/server'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { BreakingBanner } from '@/components/breaking-banner'
import { getSiteUrl } from '@/lib/env'
import type { Metadata } from 'next'

// New Homepage Components
import { FilterBar } from '@/components/home/filter-bar'
import { LeftSidebar } from '@/components/home/left-sidebar'
import { RightSidebar } from '@/components/home/right-sidebar'
import { MainFeed } from '@/components/home/main-feed'
import { CategorySection } from '@/components/home/category-section'

// Data Fetching
import { getTrendingPosts } from '@/components/trending-posts'
import { getMostPopular } from '@/components/most-popular'

// Re-using existing helper with improved typing
async function getSiteConfig() {
  const supabase = await createClient()
  const { data, error } = await (supabase
    .from('site_config') as any)
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching site config:', error)
    return null
  }

  return data as {
    id: string
    hero_post_id: string | null
    breaking_banner_active: boolean | null
    breaking_banner_text: string | null
    pinned_post_ids: string[] | null
    [key: string]: any
  } | null
}

async function getHeroAndPinnedPosts(config: any) {
  const supabase = await createClient()
  const postIds: string[] = []

  if (config?.hero_post_id) postIds.push(config.hero_post_id)
  if (config?.pinned_post_ids && Array.isArray(config.pinned_post_ids)) {
    postIds.push(...config.pinned_post_ids)
  }

  if (postIds.length === 0) return { heroPost: null, pinnedPosts: [] }

  const { data, error } = await (supabase
    .from('posts') as any)
    .select('*')
    .eq('status', 'published')
    .in('id', postIds)

  if (error) {
    console.error('Error fetching hero/pinned posts:', error)
    return { heroPost: null, pinnedPosts: [] }
  }

  const typedData = (data || []) as any[]
  const heroPost = config?.hero_post_id
    ? typedData.find((p: any) => p.id === config.hero_post_id) || null
    : null

  const pinnedPosts = config?.pinned_post_ids
    ? typedData.filter((p: any) => config.pinned_post_ids?.includes(p.id)) || []
    : []

  return { heroPost, pinnedPosts }
}

async function getEditorsPicks() {
  const supabase = await createClient()
  const { data, error } = await (supabase
    .from('posts') as any)
    .select('*')
    .eq('status', 'published')
    .eq('is_editors_pick', true)
    .order('published_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching editors picks:', error)
    return []
  }

  return (data || []) as any[]
}

import { buildPostQuery, FilterOptions, POSTS_PER_PAGE } from '@/utils/supabase/queries'

// ... existing imports ...

// Helper to fetch filtered posts for the main feed
async function getPublishedPosts(
  page: number = 1,
  filters: FilterOptions = {},
  excludeIds: string[] = []
) {
  const supabase = await createClient()
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const query = buildPostQuery(supabase, filters, excludeIds)

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], total: 0 }
  }

  return {
    posts: (data || []) as any[],
    total: count || 0,
  }
}

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl()
  return {
    title: 'ইনশর্ট | সত্যের পথে অবিচল - ব্রেকিং নিউজ এবং বিশ্লেষণ',
    description: 'বাংলাদেশ ও বিশ্বের সর্বশেষ খবর, রাজনীতি, অর্থনীতি, প্রযুক্তি এবং খেলার আপডেট জানুন সবার আগে।',
    keywords: ['bangla news', 'bd news', 'inshortbd', 'breaking news', 'politics', 'sports'],
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: 'ইনশর্ট | সত্যের পথে অবিচল',
      description: 'বাংলাদেশ ও বিশ্বের সর্বশেষ খবর জানুন।',
      url: siteUrl,
      siteName: 'ইনশর্ট',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ইনশর্ট | সত্যের পথে অবিচল',
      description: 'বাংলাদেশ ও বিশ্বের সর্বশেষ খবর জানুন।',
      creator: '@InshortBD',
    },
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    date?: string;
    timeRange?: string;
    sort?: string;
  }>
}) {
  const resolvedSearchParams = await searchParams
  const currentPage = parseInt(resolvedSearchParams?.page || '1', 10) || 1

  // Extract filters from URL
  const filters: FilterOptions = {
    category: resolvedSearchParams.category,
    date: resolvedSearchParams.date,
    timeRange: resolvedSearchParams.timeRange,
    sort: resolvedSearchParams.sort,
  }

  const configPromise = getSiteConfig()
  const trendingPromise = getTrendingPosts([], 5)
  const popularPromise = getMostPopular(3)

  // 1. Resolve Config first to determine Hero/Pinned (needed for exclusion)
  const config = await configPromise

  // 2. Fetch Hero based on config (Pinned is now deprecated in favor of is_editors_pick)
  const { heroPost } = await getHeroAndPinnedPosts(config)

  // 3. Fetch Editors Picks (Dynamic)
  const editorsPicksPromise = getEditorsPicks()

  // 3b. Fetch Featured Collections (New)
  const collectionsPromise = (async () => {
    const supabase = await createClient()
    const { data, error } = await (supabase.from('collections') as any)
      .select('id, title, slug, featured_image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    return (data || []) as any[]
  })()

  // 4. Parallel Fetch
  const [
    editorsPicks,
    trendingPosts,
    popularPosts,
    collections,
    politicsPosts,
    businessPosts,
    techPosts,
    culturePosts,
    worldPosts
  ] = await Promise.all([
    editorsPicksPromise,
    trendingPromise,
    popularPromise,
    collectionsPromise,
    // Fetch top 4 for each highlight category
    getPublishedPosts(1, { category: 'Politics' }).then(res => res.posts.slice(0, 4)),
    getPublishedPosts(1, { category: 'Business' }).then(res => res.posts.slice(0, 4)),
    getPublishedPosts(1, { category: 'Tech' }).then(res => res.posts.slice(0, 4)),
    getPublishedPosts(1, { category: 'Culture' }).then(res => res.posts.slice(0, 4)),
    getPublishedPosts(1, { category: 'World' }).then(res => res.posts.slice(0, 4)),
  ])

  // 5. Prepare Excludes
  // Only exclude Hero/Editors Picks if we are on the MAIN feed (no weird filters)
  // If user is filtering by "Tech", we shouldn't arbitrarily exclude the Hero if it equals Tech.
  // Actually, standard behavior is to exclude duplicates always.
  const excludeIds: string[] = []
  if (heroPost) excludeIds.push(heroPost.id)
  if (editorsPicks.length > 0) excludeIds.push(...editorsPicks.map((p: any) => p.id))

  // 6. Fetch Main Feed with Filters
  const { posts: feedPosts, total } = await getPublishedPosts(currentPage, filters, excludeIds)

  return (
    <div className="min-h-screen bg-white text-slate-text font-sans">
      {/* Top Alert */}
      <h1 className="sr-only">ইনশর্ট - ব্রেকিং নিউজ</h1>
      <BreakingBanner />

      {/* Header */}
      <Navigation breakingBannerActive={config?.breaking_banner_active || false} />

      {/* Filter Bar (Now Functional) */}
      <FilterBar />

      {/* Main Content Layout */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">

          {/* Left Sidebar (In-Depth Series, Editor's Picks) */}
          <LeftSidebar
            collections={collections}
            editorsPicks={editorsPicks}
          />

          {/* Center Content (Hero, Grid, List) */}
          <MainFeed
            heroPost={filters.category || filters.sort || filters.date ? null : heroPost}
            feedPosts={feedPosts}
          />

          {/* Right Sidebar (Trending, Popular, Live, Categories) */}
          <RightSidebar
            popularPosts={popularPosts}
            trendingPosts={trendingPosts}
          />

        </div>

        {/* Full Width Category Highlights (Desktop: Bigger Cards) */}
        <div className="mt-16 space-y-16">
          <CategorySection category="Politics" title="রাজনীতি" posts={politicsPosts} color="red" />
          <CategorySection category="Business" title="ব্যবসা-বাণিজ্য" posts={businessPosts} color="blue" />
          <CategorySection category="Tech" title="প্রযুক্তি" posts={techPosts} color="purple" />
          <CategorySection category="Culture" title="সংস্কৃতি ও বিনোদন" posts={culturePosts} color="orange" />
          <CategorySection category="World" title="বিশ্ব" posts={worldPosts} color="green" />
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
