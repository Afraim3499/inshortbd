import { createClient } from '@/utils/supabase/server'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { Pagination } from '@/components/pagination'
import { EmptyState } from '@/components/empty-state'
import { NewsImage } from '@/components/news-image'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSiteUrl } from '@/lib/env'
import Link from 'next/link'

const POSTS_PER_PAGE = 20

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const year = parseInt(resolvedParams.year)
  const month = parseInt(resolvedParams.month)
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' })
  const siteUrl = getSiteUrl()
  const canonicalUrl = `${siteUrl}/archive/${year}/${month}`

  return {
    title: `${monthName} ${year} Archive`,
    description: `Read all articles published in ${monthName} ${year} on Inshort.`,
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

async function getPostsByMonth(year: number, month: number, page: number = 1) {
  const supabase = await createClient()

  // Create date range for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data, error, count } = await (supabase
    .from('posts') as any)
    .select('id, title, slug, excerpt, featured_image_url, published_at, views, category', {
      count: 'exact',
    })
    .eq('status', 'published')
    .gte('published_at', startDate.toISOString())
    .lte('published_at', endDate.toISOString())
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching archive posts:', error)
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
      category: string | null
    }>,
    total: count || 0
  }
}

async function getAvailableMonths() {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('posts') as any)
    .select('published_at')
    .eq('status', 'published')
    .not('published_at', 'is', null)

  if (error || !data) {
    return []
  }

  const months = new Set<string>()
  const typedData = (data || []) as Array<{ published_at: string | null }>
  typedData.forEach((post: any) => {
    if (post.published_at) {
      const date = new Date(post.published_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.add(key)
    }
  })

  return Array.from(months)
    .map((key) => {
      const [year, month] = key.split('-').map(Number)
      return { year, month, key }
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
}

import { BreadcrumbStructuredData, CollectionPageStructuredData } from '@/components/structured-data'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default async function ArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ year: string; month: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { page } = resolvedSearchParams
  const year = parseInt(resolvedParams.year)
  const month = parseInt(resolvedParams.month)
  const currentPage = parseInt(page || '1', 10) || 1
  const siteUrl = getSiteUrl()

  // Validate month
  if (month < 1 || month > 12 || isNaN(year) || isNaN(month)) {
    notFound()
  }

  const { posts, total } = await getPostsByMonth(year, month, currentPage)
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  const availableMonths = await getAvailableMonths()

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' })

  return (
    <>
      <CollectionPageStructuredData
        name={`Archive: ${monthName} ${year} - Inshort`}
        description={`Articles published in ${monthName} ${year} on Inshort.`}
        url={`/archive/${year}/${month}`}
        siteUrl={siteUrl}
        hasPart={posts.map(p => `/news/${p.slug}`)}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: 'Archives', url: '/archive' },
          { name: `${monthName} ${year}`, url: `/archive/${year}/${month}` }
        ]}
        siteUrl={siteUrl}
      />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: 'Archives', href: '/archive' },
              { label: `${monthName} ${year}`, href: `/archive/${year}/${month}` },
            ]}
          />
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2">
              Archive: {monthName} {year}
            </h1>
            <p className="text-muted-foreground">
              {total} {total === 1 ? 'article' : 'articles'} published this month
            </p>
          </div>

          {/* Archive Navigation */}
          {availableMonths.length > 0 && (
            <div className="mb-8 pb-8 border-b border-border">
              <h2 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
                Browse Archives
              </h2>
              <div className="flex flex-wrap gap-2">
                {availableMonths.slice(0, 12).map(({ year: y, month: m, key }) => {
                  const mName = new Date(y, m - 1).toLocaleString('default', { month: 'short' })
                  const isActive = y === year && m === month
                  return (
                    <Link
                      key={key}
                      href={`/archive/${y}/${m}`}
                      className={`px-3 py-1 rounded-md border text-sm transition-colors ${isActive
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-accent'
                        }`}
                    >
                      {mName} {y}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/news/${post.slug}`}
                    className="group block border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
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
                        {post.category}
                      </span>
                      <h2 className="text-xl font-heading font-bold mt-2 mb-2 group-hover:text-accent transition-colors line-clamp-2">
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
                            {new Date(post.published_at).toLocaleDateString()}
                          </time>
                        )}
                        {post.views !== null && (
                          <>
                            <span>•</span>
                            <span>{post.views} views</span>
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
                    baseUrl={`/archive/${year}/${month}`}
                    searchParams={resolvedSearchParams}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              type="articles"
              title={`No articles in ${monthName} ${year}`}
              description="This month doesn&apos;t have any published articles yet."
              action={
                availableMonths.length > 0
                  ? {
                    label: 'Browse Other Archives',
                    href: `/archive/${availableMonths[0].year}/${availableMonths[0].month}`,
                  }
                  : {
                    label: 'Go Home',
                    href: '/',
                  }
              }
            />
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

