import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { Pagination } from '@/components/pagination'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { EmptyState } from '@/components/empty-state'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSiteUrl } from '@/lib/env'
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/constants'

const POSTS_PER_PAGE = 20

// ... imports

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const siteUrl = getSiteUrl()
  const canonicalUrl = `${siteUrl}/category/${encodeURIComponent(category)}`

  return {
    title: `${decodedCategory} News`,
    description: `Latest ${decodedCategory} news, analysis, and reports from Inshort.`,
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

async function getPostsByCategory(
  category: string,
  page: number = 1
) {
  const supabase = await createClient()
  const decodedCategory = decodeURIComponent(category)
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data, error, count } = await (supabase
    .from('posts') as any)
    .select('id, title, slug, excerpt, featured_image_url, published_at, views', {
      count: 'exact',
    })
    .eq('status', 'published')
    .ilike('category', decodedCategory)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching posts by category:', error)
    return { posts: [], total: 0 }
  }

  return {
    posts: (data || []) as Array<{
      id: string
      title: string
      slug: string
      excerpt: string | null
      featured_image_url: string | null
      published_at: string | null
      views: number | null
    }>,
    total: count || 0
  }
}

async function getCategoryCounts() {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('posts') as any)
    .select('category')
    .eq('status', 'published')

  if (error) {
    console.error('Error fetching category counts:', error)
    return {}
  }

  const counts: Record<string, number> = {}
  const typedData = (data || []) as Array<{ category: string | null }>
  typedData.forEach((post: any) => {
    if (post.category) {
      counts[post.category] = (counts[post.category] || 0) + 1
    }
  })

  return counts
}

import { CollectionPageStructuredData, BreadcrumbStructuredData } from '@/components/structured-data'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { category } = await params
  const { page } = await searchParams

  const currentPage = parseInt(page || '1', 10) || 1
  const { posts, total } = await getPostsByCategory(category, currentPage)
  const categoryCounts = await getCategoryCounts()
  const decodedCategory = decodeURIComponent(category)
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  const siteUrl = getSiteUrl()

  // ... rest of logic uses `posts`, `total`, `category` (already awaited), etc.

  // IMPORTANT: Update pagination and links to use the `category` variable which is now a string

  if (posts.length === 0 && currentPage === 1) {
    notFound()
  }

  // Fetch active categories for the sidebar
  const supabase = await createClient()
  const { data: categoryData } = await supabase
    .from('content_goals')
    .select('category')
    .order('category')

  const fetchedCategories = categoryData?.map((c: { category: string }) => c.category) || []
  const activeCategories = fetchedCategories.length > 0 ? fetchedCategories : DEFAULT_CATEGORIES

  return (
    <>
      <CollectionPageStructuredData
        name={`${decodedCategory} - Inshort`}
        description={`Latest news and updates in ${decodedCategory}`}
        url={`/category/${category}`}
        siteUrl={siteUrl}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: decodedCategory, url: `/category/${category}` }
        ]}
        siteUrl={siteUrl}
      />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: decodedCategory, href: `/category/${category}` },
            ]}
          />
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2">
              {decodedCategory}
            </h1>
            <p className="text-muted-foreground">
              {total.toLocaleString('bn-BD')}টি খবর পাওয়া গিয়েছে
            </p>
          </div>

          <div className="mb-8 pb-8 border-b border-border">
            <h2 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
              অন্যান্য বিভাগ
            </h2>
            <div className="flex flex-wrap gap-2">
              {activeCategories.map((cat: string) => (
                <Link
                  key={cat}
                  href={`/category/${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-md border transition-colors ${cat === decodedCategory
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border hover:border-accent'
                    }`}
                >
                  {cat}
                  {categoryCounts[cat] && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({categoryCounts[cat].toLocaleString('bn-BD')})
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group block border border-border rounded-lg overflow-hidden hover:border-accent hover:shadow-lg transition-all duration-200"
                aria-label={`Read article: ${post.title}`}
              >
                {post.featured_image_url && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <NewsImage
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-mono text-accent uppercase">
                    {decodedCategory}
                  </span>
                  <h2 className="text-xl font-heading font-bold mt-2 mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    {post.published_at && (
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                    {post.views !== null && (
                      <>
                        <span>•</span>
                        <span>{post.views.toLocaleString('bn-BD')} বার পঠিত</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 pt-8 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/category/${encodeURIComponent(category)}`}
                searchParams={{ page }}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}



