import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import { NewsImage } from '@/components/news-image'
import { Pagination } from '@/components/pagination'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Database } from '@/types/database.types'
import { getSiteUrl } from '@/lib/env'

const POSTS_PER_PAGE = 20

type Profile = Database['public']['Tables']['profiles']['Row']

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getAuthor(id: string) {
  if (!UUID_REGEX.test(id)) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Profile
}

async function getAuthorPosts(authorId: string, page: number = 1) {
  if (!UUID_REGEX.test(authorId)) return { posts: [], total: 0 }

  const supabase = await createClient()
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data, error, count } = await (supabase
    .from('posts') as any)
    .select('*', { count: 'exact' })
    .eq('author_id', authorId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching author posts:', error)
    return { posts: [], total: 0 }
  }

  return {
    posts: (data || []) as any[],
    total: count || 0
  }
}

import { ProfilePageStructuredData, BreadcrumbStructuredData, CollectionPageStructuredData } from '@/components/structured-data'
import { Breadcrumbs } from '@/components/breadcrumbs'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const author = await getAuthor(id)
  const siteUrl = getSiteUrl()

  if (!author) {
    return {
      title: 'Author Not Found',
    }
  }

  const authorName = author.full_name || author.email || 'Author'
  const canonicalUrl = `${siteUrl}/author/${id}`

  return {
    title: `${authorName} - Author Profile`,
    description: `Read articles and insights by ${authorName} on Inshort.`,
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  const author = await getAuthor(params.id)
  const currentPage = parseInt(searchParams?.page || '1', 10) || 1
  const { posts, total } = await getAuthorPosts(params.id, currentPage)
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  const siteUrl = getSiteUrl()

  if (!author) {
    notFound()
  }

  const authorName = author.full_name || author.email || 'Unknown Author'
  const authorUrl = `/author/${params.id}`
  const postUrls = posts.map(p => `/news/${p.slug}`)

  return (
    <>
      <ProfilePageStructuredData
        name={authorName}
        description={`Author profile for ${authorName}. ${total} articles published on Inshort.`}
        image={author.avatar_url || undefined}
        url={authorUrl}
        siteUrl={siteUrl}
      />
      <CollectionPageStructuredData
        name={`${authorName} - Author Archives`}
        description={`All articles and insights by ${authorName} on Inshort.`}
        url={authorUrl}
        siteUrl={siteUrl}
        hasPart={postUrls}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: 'Authors', url: '/editorial-team' },
          { name: authorName, url: `/author/${params.id}` }
        ]}
        siteUrl={siteUrl}
      />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Breadcrumbs
            items={[
              { label: 'Authors', href: '/editorial-team' },
              { label: authorName, href: `/author/${params.id}` },
            ]}
          />
          <div className="mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-6">
              {author.avatar_url ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border">
                  <NewsImage
                    src={author.avatar_url}
                    alt={authorName}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-heading font-bold">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-4xl font-heading font-bold">{authorName}</h1>
                {author.email && (
                  <p className="text-muted-foreground mt-1">{author.email}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2 font-mono">
                  {total.toLocaleString('bn-BD')}টি খবর প্রকাশিত হয়েছে
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">{authorName}-এর নিবন্ধসমূহ</h2>
            <div className="grid gap-6">
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <article key={post.id} className="grid md:grid-cols-3 gap-6 group">
                    <Link href={`/news/${post.slug}`}>
                      <div className="aspect-video rounded-md md:col-span-1 border border-border/50 overflow-hidden relative">
                        <NewsImage
                          src={post.featured_image_url}
                          alt={post.title}
                          fill
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <span className="text-accent uppercase">{post.category}</span>
                        {post.published_at && (
                          <>
                            <span>•</span>
                            <span>{new Date(post.published_at).toLocaleDateString('bn-BD')}</span>
                          </>
                        )}
                        {post.views !== null && (
                          <>
                            <span>•</span>
                            <span>{post.views.toLocaleString('bn-BD')} বার পঠিত</span>
                          </>
                        )}
                      </div>
                      <Link href={`/news/${post.slug}`}>
                        <h2 className="text-2xl font-heading font-bold group-hover:text-accent transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  এখনো কোনো নিবন্ধ প্রকাশিত হয়নি।
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 pt-8 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/author/${params.id}`}
                searchParams={searchParams}
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



