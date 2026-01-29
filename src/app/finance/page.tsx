import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { Pagination } from '@/components/pagination'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/env'
import { CollectionPageStructuredData, BreadcrumbStructuredData } from '@/components/structured-data'

const POSTS_PER_PAGE = 20
const CATEGORY_NAME = 'Finance'
const CATEGORY_SLUG = 'finance'

export const metadata: Metadata = {
    title: 'Finance - Inshort',
    description: 'Latest finance news, analysis, and reports from Inshort.',
}

async function getPostsByCategory(page: number = 1) {
    const supabase = await createClient()
    const from = (page - 1) * POSTS_PER_PAGE
    const to = from + POSTS_PER_PAGE - 1

    const { data, error, count } = await (supabase
        .from('posts') as any)
        .select('id, title, slug, excerpt, featured_image_url, published_at, views', {
            count: 'exact',
        })
        .eq('status', 'published')
        .ilike('category', CATEGORY_NAME)
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

export default async function FinancePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page } = await searchParams
    const currentPage = parseInt(page || '1', 10) || 1
    const { posts, total } = await getPostsByCategory(currentPage)
    const categoryCounts = await getCategoryCounts()
    const totalPages = Math.ceil(total / POSTS_PER_PAGE)
    const siteUrl = getSiteUrl()

    // Fetch active categories for the sidebar
    const supabase = await createClient()
    const { data: categoryData } = await supabase
        .from('content_goals')
        .select('category')
        .order('category')

    const fetchedCategories = categoryData?.map((c: { category: string }) => c.category) || []
    const CATEGORIES = fetchedCategories.length > 0 ? fetchedCategories : ['Politics', 'Tech', 'Culture', 'Business', 'World']

    return (
        <>
            <CollectionPageStructuredData
                name={`${CATEGORY_NAME} - Inshort`}
                description={`Latest news and updates in ${CATEGORY_NAME}`}
                url={`/${CATEGORY_SLUG}`}
                siteUrl={siteUrl}
            />
            <BreadcrumbStructuredData
                items={[
                    { name: 'Home', url: '/' },
                    { name: CATEGORY_NAME, url: `/${CATEGORY_SLUG}` }
                ]}
                siteUrl={siteUrl}
            />
            <Navigation />
            <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-heading font-bold mb-2">
                            {CATEGORY_NAME}
                        </h1>
                        <p className="text-muted-foreground">
                            {total} {total === 1 ? 'article' : 'articles'} found
                        </p>
                    </div>

                    <div className="mb-8 pb-8 border-b border-border">
                        <h2 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
                            Browse Categories
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat: string) => (
                                <Link
                                    key={cat}
                                    href={`/category/${encodeURIComponent(cat)}`}
                                    className={`px-4 py-2 rounded-md border transition-colors ${cat === CATEGORY_NAME
                                        ? 'border-accent bg-accent/10 text-accent'
                                        : 'border-border hover:border-accent'
                                        }`}
                                >
                                    {cat}
                                    {categoryCounts[cat] && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({categoryCounts[cat]})
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
                                        {CATEGORY_NAME}
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
                                                {new Date(post.published_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    timeZone: 'UTC'
                                                })}
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

                    {totalPages > 1 && (
                        <div className="mt-8 pt-8 border-t border-border">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                baseUrl={`/${CATEGORY_SLUG}`}
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
