import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { Pagination } from '@/components/pagination'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSiteUrl } from '@/lib/env'

const POSTS_PER_PAGE = 20

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const siteUrl = getSiteUrl()
  const canonicalUrl = `${siteUrl}/tag/${encodeURIComponent(tag)}`

  return {
    title: `${decodedTag} News & Updates`,
    description: `Latest articles, news, and updates about ${decodedTag} from Inshort.`,
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

async function getPostsByTag(tag: string, page: number = 1) {
  const supabase = await createClient()
  const decodedTag = decodeURIComponent(tag)
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data, error, count } = await (supabase
    .from('posts') as any)
    .select('id, title, slug, excerpt, featured_image_url, published_at, category', {
      count: 'exact',
    })
    .eq('status', 'published')
    .contains('tags', [decodedTag])
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching posts by tag:', error)
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
      category: string | null
    }>,
    total: count || 0
  }
}

import { CollectionPageStructuredData, BreadcrumbStructuredData } from '@/components/structured-data'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { tag } = await params
  const { page } = await searchParams
  const currentPage = parseInt(page || '1', 10) || 1
  const { posts, total } = await getPostsByTag(tag, currentPage)
  const decodedTag = decodeURIComponent(tag)
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  const siteUrl = getSiteUrl()

  if (posts.length === 0 && currentPage === 1) {
    notFound()
  }

  return (
    <>
      <CollectionPageStructuredData
        name={`Tag: ${decodedTag} - Inshort`}
        description={`All articles, news, and updates about ${decodedTag} from Inshort.`}
        url={`/tag/${tag}`}
        siteUrl={siteUrl}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tags', url: '/archive' }, // Better mapping than nothing
          { name: decodedTag, url: `/tag/${tag}` }
        ]}
        siteUrl={siteUrl}
      />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: 'Tags', href: '/archive' },
              { label: decodedTag, href: `/tag/${tag}` },
            ]}
          />
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2">
              Tag: {decodedTag}
            </h1>
            <p className="text-muted-foreground">
              {total} {total === 1 ? 'article' : 'articles'} found
            </p>
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
                    {post.category}
                  </span>
                  <h2 className="text-xl font-heading font-bold mt-2 mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.published_at && (
                    <time
                      dateTime={post.published_at}
                      className="text-xs text-muted-foreground mt-2 block"
                    >
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
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
                baseUrl={`/tag/${encodeURIComponent(tag)}`}
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



