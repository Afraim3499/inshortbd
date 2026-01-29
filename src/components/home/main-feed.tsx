'use client'

import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { useState, useEffect } from 'react'
import { loadMorePosts } from '@/app/actions/news'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { FilterOptions } from '@/utils/supabase/queries'

interface Post {
    id: string
    title: string
    slug: string
    excerpt?: string
    category?: string
    published_at?: string
    featured_image_url?: string
    reading_time?: string
    views?: number | null
}

interface MainFeedProps {
    heroPost: Post | null
    feedPosts: Post[]
}

export function MainFeed({
    heroPost,
    feedPosts: initialPosts,
}: MainFeedProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts)
    const [page, setPage] = useState(2)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const searchParams = useSearchParams()

    const isFiltered = !!(searchParams.get('category') || searchParams.get('sort') || searchParams.get('date'))

    useEffect(() => {
        setPosts(initialPosts)
        setPage(2)
        setHasMore(true)
    }, [initialPosts, searchParams])

    // On main homepage (unfiltered), we limit the "Latest" list to 8 items
    // On filtered pages, we show everything and enable infinite scroll
    const displayPosts = isFiltered ? posts : posts.slice(0, 8)
    const showLoadMore = isFiltered && hasMore

    // For the "Latest News" section:
    // First 2 are "Grid" (side by side)
    const gridPosts = displayPosts.slice(0, 2)
    // Next 6 are "List" 
    const listPosts = displayPosts.slice(2)

    const handleLoadMore = async () => {
        setLoading(true)
        try {
            const filters: FilterOptions = {
                category: searchParams.get('category') || undefined,
                date: searchParams.get('date') || undefined,
                timeRange: searchParams.get('timeRange') || undefined,
                sort: searchParams.get('sort') || undefined
            }

            const newPosts = await loadMorePosts(page, filters)

            if (newPosts.length === 0) {
                setHasMore(false)
            } else {
                setPosts(prev => [...prev, ...newPosts])
                setPage(prev => prev + 1)
            }
        } catch (error) {
            console.error('Failed to load more:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
            {/* Hero Story - Only shown if not filtered (handled by parent, but double check here) */}
            {heroPost && !isFiltered && (
                <article className="mb-12 group cursor-pointer">
                    <Link href={`/news/${heroPost.slug}`} className="block">
                        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 relative shadow-sm">
                            <NewsImage
                                src={heroPost.featured_image_url}
                                alt={heroPost.title}
                                fill
                                priority
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider font-sans">
                                    {heroPost.category || 'News'}
                                </span>
                            </div>
                        </div>
                        <h1 className="font-black text-3xl md:text-4xl lg:text-5xl text-ink-black mb-4 leading-tight group-hover:text-blood-red transition-colors font-display">
                            {heroPost.title}
                        </h1>
                        <p className="text-gray-600 font-serif text-xl leading-relaxed mb-4 line-clamp-3">
                            {heroPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-meta-gray font-mono">
                            <span className="uppercase font-bold tracking-wide text-primary">{heroPost.category}</span>
                            <span>•</span>
                            <span suppressHydrationWarning>{heroPost.published_at ? new Date(heroPost.published_at).toLocaleDateString('bn-BD') : 'এইমাত্র'}</span>
                        </div>
                    </Link>
                </article>
            )}

            {/* Latest News Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6 border-b border-black pb-2">
                    <h2 className="text-xl font-bold font-sans uppercase tracking-wider">
                        {isFiltered ? 'সদ্য প্রাপ্ত সংবাদ' : 'প্রধান খবর'}
                    </h2>
                </div>

                {/* News Grid (2 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    {gridPosts.map(post => {
                        const catColor =
                            post.category?.toLowerCase() === 'tech' ? 'text-purple-600' :
                                post.category?.toLowerCase() === 'culture' ? 'text-orange-600' :
                                    'text-blue-600'

                        return (
                            <article key={post.id} className="group">
                                <Link href={`/news/${post.slug}`} className="block">
                                    <div className="aspect-video rounded-xl overflow-hidden mb-3 relative shadow-sm bg-gray-100">
                                        <NewsImage
                                            src={post.featured_image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <span className={`text-xs font-bold ${catColor} uppercase tracking-wider font-sans`}>
                                        {post.category || 'News'}
                                    </span>
                                    <h3 className="font-bold text-lg text-ink-black mt-1 mb-2 leading-tight group-hover:text-blood-red transition-colors font-display line-clamp-3">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-meta-gray font-mono">
                                        <span suppressHydrationWarning>{post.published_at ? new Date(post.published_at).toLocaleDateString('bn-BD') : 'সাম্প্রতিক'}</span>
                                    </div>
                                </Link>
                            </article>
                        )
                    })}
                </div>

                {/* Vertical List */}
                <div className="space-y-6">
                    {listPosts.map(post => (
                        <article key={post.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 group">
                            <Link href={`/news/${post.slug}`} className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-24 rounded-lg overflow-hidden relative shadow-sm bg-gray-100">
                                <NewsImage
                                    src={post.featured_image_url}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </Link>
                            <div className="flex-1">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider font-sans">
                                    {post.category || 'News'}
                                </span>
                                <h4 className="font-bold text-base sm:text-lg text-ink-black mt-1 mb-1 leading-tight group-hover:text-blood-red transition-colors font-display">
                                    <Link href={`/news/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-meta-gray font-mono mt-1">
                                    <span suppressHydrationWarning>{post.published_at ? new Date(post.published_at).toLocaleDateString('bn-BD') : 'আজ'}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Pagination / Load More (Only for filtered views) */}
                {showLoadMore && (
                    <div className="text-center mt-8">
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-blood-red hover:text-white transition-all font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'লোড হচ্ছে...' : 'আরও খবর দেখুন'}
                        </button>
                    </div>
                )}
            </div>


        </div>
    )
}

