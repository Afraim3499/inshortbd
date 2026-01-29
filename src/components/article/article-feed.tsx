'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArticleView } from '@/components/article/article-view'
import { getNextArticles } from '@/app/actions/articles/get-next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArticleFeedProps {
    initialPost: any
    initialHtml?: string
    authorName?: string
    trendingPosts?: any[]
}

export function ArticleFeed({ initialPost, initialHtml, authorName, trendingPosts = [] }: ArticleFeedProps) {
    const [articles, setArticles] = useState<any[]>([{
        post: initialPost,
        authorName,
        key: initialPost.id
    }])
    const [nextBatch, setNextBatch] = useState<any[]>([])
    const [loadingBatch, setLoadingBatch] = useState(false)
    const [loadedCount, setLoadedCount] = useState(0) // How many EXTRA articles we have shown
    const MAX_ARTICLES = 4 // Limit to 4 additional

    // Refs for scroll observation
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadTriggerRef = useRef<HTMLDivElement>(null)

    // Ref for URL updating (ScrollSpy)
    const articleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

    // 1. Fetch Recommendations on Mount
    useEffect(() => {
        async function fetchNext() {
            setLoadingBatch(true)
            try {
                const { posts } = await getNextArticles(
                    initialPost.id,
                    initialPost.category,
                    initialPost.tags || [],
                    MAX_ARTICLES
                )
                setNextBatch(posts)
            } catch (e) {
                console.error("Failed to load next articles", e)
            } finally {
                setLoadingBatch(false)
            }
        }
        fetchNext()
    }, [initialPost.id, initialPost.category, initialPost.tags])

    // 2. Setup "Load More" Observer
    useEffect(() => {
        if (loadedCount >= MAX_ARTICLES) return // Stop if limit reached
        if (nextBatch.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextBatch.length > loadedCount) {
                    // Load next article
                    const nextArticle = nextBatch[loadedCount]

                    // We need to fetch author name if strictly needed, 
                    // but for now we'll pass undefined and let ArticleView handle fallback
                    // ensuring smoother loading. 
                    // Ideally getNextArticles would return author info joined, but skipping for speed.

                    setArticles(prev => [...prev, {
                        post: nextArticle,
                        key: nextArticle.id
                    }])
                    setLoadedCount(prev => prev + 1)
                }
            },
            { threshold: 0.1, rootMargin: '200px' } // Load slightly before reaching bottom
        )

        if (loadTriggerRef.current) {
            observer.observe(loadTriggerRef.current)
        }

        return () => observer.disconnect()
    }, [nextBatch, loadedCount])

    // 3. Setup ScrollSpy for URL Updates
    useEffect(() => {
        const handleScroll = () => {
            let currentSlug = initialPost.slug
            let maxVisibleRatio = 0

            // Check which article is most visible
            Object.entries(articleRefs.current).forEach(([slug, el]) => {
                if (!el) return
                const rect = el.getBoundingClientRect()
                const windowHeight = window.innerHeight

                // Calculate visible height
                const visibleTop = Math.max(0, rect.top)
                const visibleBottom = Math.min(windowHeight, rect.bottom)
                const visibleHeight = Math.max(0, visibleBottom - visibleTop)

                const ratio = visibleHeight / windowHeight

                // Logic: if article covers > 30% of screen and is near top
                if (ratio > maxVisibleRatio) {
                    maxVisibleRatio = ratio
                    currentSlug = slug
                }
            })

            if (currentSlug && window.location.pathname !== `/news/${currentSlug}`) {
                window.history.replaceState(null, '', `/news/${currentSlug}`)
                document.title = articles.find(a => a.post.slug === currentSlug)?.post.title || document.title
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [articles, initialPost.slug])


    return (
        <div className="space-y-0">
            {articles.map((item, index) => (
                <div
                    key={item.key}
                    ref={el => { articleRefs.current[item.post.slug] = el }}
                    className="min-h-screen" // Ensure min height for observation
                >
                    <ArticleView
                        post={item.post}
                        contentHtml={index === 0 ? initialHtml : undefined}
                        authorName={item.authorName} // Only valid for first one usually
                        trendingPosts={trendingPosts}
                        isFeedItem={index > 0}
                    />
                </div>
            ))}

            {/* Trigger Area */}
            {loadedCount < MAX_ARTICLES && (
                <div ref={loadTriggerRef} className="py-20 text-center">
                    {loadedCount < nextBatch.length ? (
                        <div className="flex flex-col items-center text-muted-foreground gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p className="text-sm font-serif italic">পরবর্তী খবর লোড হচ্ছে...</p>
                        </div>
                    ) : (
                        // Logic: We have loaded all from batch, or batch was empty
                        nextBatch.length > 0 && loadedCount >= nextBatch.length ? null :
                            // Batch empty?
                            loadingBatch ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : null
                    )}
                </div>
            )}
        </div>
    )
}
