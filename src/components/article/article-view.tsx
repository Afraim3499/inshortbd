'use client'
import { ReservedChart } from '@/components/ui/reserved-chart'
import { NewsImage } from '@/components/news-image'
import { SocialShare } from '@/components/social-share'
import { AuthorBio } from '@/components/author-bio'
import { RelatedArticles } from '@/components/related-articles'
import { ReadingTime } from '@/components/reading-time'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { CommentList } from '@/components/comments/comment-list'
import { CollectionNav } from '@/components/collections/collection-nav'
import { TableOfContents } from '@/components/table-of-contents'
import { AdUnit } from '@/components/ads/ad-unit'
import { RelatedStories } from '@/components/news/related-stories'
import { KeyTakeaways } from '@/components/article/key-takeaways'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { sanitizeHtml } from '@/lib/sanitize'
import { formatBanglaDate } from '@/utils/bangla-date'
import { useEffect, useState, useMemo } from 'react'

interface ArticleViewProps {
    post: any
    contentHtml?: string
    authorName?: string
    authorId?: string
    trendingPosts?: any[]
    isFeedItem?: boolean
    keyTakeaways?: string[] // Passed from DB or extracted
}

export function ArticleView({ post, contentHtml, authorName, authorId, trendingPosts = [], isFeedItem = false, keyTakeaways }: ArticleViewProps) {
    // Fallback: If no DB takeaways, extracting from content is handled in Parent (recommended) or here? 
    // We'll trust the prop passed in specific implementation

    // Client-side rendering of content
    const finalHtml = useMemo(() => {
        if (contentHtml) return contentHtml
        if (!post.content) return null

        try {
            const html = generateHTML(post.content, [
                StarterKit,
                Image.configure({
                    HTMLAttributes: {
                        class: 'max-w-full h-auto my-8',
                    },
                }),
                TextStyle,
                Color,
                Link.configure({
                    openOnClick: false,
                }),
            ])

            // Add IDs to headings for Table of Contents
            let htmlWithIds = html.replace(
                /<h([2-3])>(.*?)<\/h\1>/gi,
                (match: string, level: string, text: string) => {
                    const textContent = text.replace(/<[^>]*>/g, '').trim()
                    const id = textContent
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim()
                    return `<h${level} id="${id}">${text}</h${level}>`
                }
            )

            // Convert blockquotes to pull quotes
            htmlWithIds = htmlWithIds.replace(
                /<blockquote>(.*?)<\/blockquote>/gi,
                '<blockquote class="pull-quote">$1</blockquote>'
            )

            return sanitizeHtml(htmlWithIds)
        } catch (error) {
            console.error('Error rendering content:', error)
            return null
        }
    }, [post.content])

    return (
        <article className={isFeedItem ? "pt-12 border-t-4 border-gray-100 mt-12" : ""}>
            <header className="mb-16">
                {/* Row 1: Centered Title & Meta */}
                <div className="text-center max-w-4xl mx-auto mb-12">
                    <div className="flex items-center justify-center gap-3 text-sm font-medium text-muted-foreground mb-6 tracking-wide uppercase">
                        <span className="text-primary font-bold">{post.category}</span>
                        <span>•</span>
                        {post.published_at && (
                            <time dateTime={post.published_at} suppressHydrationWarning>
                                {formatBanglaDate(post.published_at)}
                            </time>
                        )}
                        {post.updated_at && post.updated_at !== post.published_at && (
                            <>
                                <span>•</span>
                                <time dateTime={post.updated_at} suppressHydrationWarning className="italic">
                                    আপডেট: {formatBanglaDate(post.updated_at)}
                                </time>
                            </>
                        )}
                        <span>•</span>
                        <ReadingTime content={post.content} />
                    </div>

                    {isFeedItem ? (
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold leading-tight text-foreground tracking-tight mb-6">
                            {post.title}
                        </h2>
                    ) : (
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold leading-tight text-foreground tracking-tight mb-6">
                            {post.title}
                        </h1>
                    )}
                </div>

                {/* Row 2: Split Layout (Context Left, Image Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Context */}
                    <div className="lg:col-span-5 flex flex-col justify-center h-full space-y-8 order-2 lg:order-1">
                        {post.excerpt && (
                            <p className="text-xl md:text-2xl text-muted-foreground font-serif leading-relaxed border-l-4 border-primary pl-6">
                                {post.excerpt}
                            </p>
                        )}

                        <div className="flex items-center gap-4 py-6 border-y border-border/50">
                            <div>
                                {authorId ? (
                                    <a href={`/author/${authorId}`} className="font-bold text-foreground hover:text-primary transition-colors">
                                        {authorName || 'ইনশর্ট টিম'}
                                    </a>
                                ) : (
                                    <div className="font-bold text-foreground">{authorName || 'ইনশর্ট টিম'}</div>
                                )}
                                <div className="text-sm text-muted-foreground">লেখক</div>
                            </div>
                            <div className="ml-auto">
                                <SocialShare
                                    url={`/news/${post.slug}`}
                                    title={post.title}
                                    description={post.excerpt || ''}
                                />
                            </div>
                        </div>

                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag: string, index: number) => (
                                    <span key={`${tag}-${index}`} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md font-medium">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Featured Image */}
                    <div className="lg:col-span-7 order-1 lg:order-2">
                        {post.featured_image_url ? (
                            <ReservedChart aspectRatio="4/3" className="rounded-xl shadow-lg border border-border/50">
                                <NewsImage
                                    src={post.featured_image_url}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    priority={!isFeedItem}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
                                />
                            </ReservedChart>
                        ) : (
                            <ReservedChart aspectRatio="2/1" className="bg-gradient-to-br from-muted to-accent/10 rounded-xl border border-border/50">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-muted-foreground font-medium">No Image Available</span>
                                </div>
                            </ReservedChart>
                        )}
                    </div>
                </div>
            </header>

            {/* Grid Layout: Article Content & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content Column */}
                <div className="lg:col-span-8">
                    {/* AI Visibility: Key Takeaways (Above the Fold) */}
                    {keyTakeaways && keyTakeaways.length > 0 && (
                        <KeyTakeaways takeaways={keyTakeaways} />
                    )}

                    <div className="prose prose-lg max-w-none font-serif text-slate-text leading-relaxed">
                        {finalHtml ? (
                            <div
                                className="article-content"
                                dangerouslySetInnerHTML={{ __html: finalHtml }}
                            />
                        ) : (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                                <p>Error rendering article content. Please contact support.</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t-2 border-card-border pt-12 mt-16">
                        <AuthorBio authorId={post.author_id} customName={authorName} />
                    </div>

                    <div className="border-t-2 border-card-border pt-12 mt-12">
                        <CollectionNav postId={post.id} />
                    </div>

                    <div className="border-t-2 border-card-border pt-12 mt-12">
                        {/* If feed item, limit related articles or hide to avoid clutter? Keeping consistent for now */}
                        <RelatedArticles
                            currentPostId={post.id}
                            category={post.category}
                            currentTags={post.tags || []}
                            limit={3}
                        />
                    </div>

                    <div className="border-t-2 border-card-border pt-12 mt-12">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-sans font-semibold mb-2 text-ink-black uppercase tracking-wide">শেয়ার করুন</h3>
                                <p className="text-sm text-meta-gray font-serif">
                                    সত্য ছড়িয়ে দিন
                                </p>
                            </div>
                            <SocialShare
                                url={`/news/${post.slug}`}
                                title={post.title}
                                description={post.excerpt || undefined}
                            />
                        </div>
                    </div>

                    <div className="border-t-2 border-card-border pt-12 mt-12">
                        <NewsletterSignup variant="inline" source="article" />
                    </div>

                    <div className="border-t-2 border-card-border pt-12 mt-12">
                        <CommentList postId={post.id} />
                    </div>
                </div>

                {/* Sidebar Column - Sticky on Desktop, Stacked on Mobile */}
                <aside className="col-span-1 lg:col-span-4 space-y-8 mt-12 lg:mt-0 pt-12 lg:pt-0 border-t-2 border-card-border lg:border-t-0">
                    <div className="sticky top-24 space-y-8">
                        <div className="bg-white border-2 border-card-border p-6 shadow-lg rounded-lg">
                            <TableOfContents content={post.content} />
                        </div>
                        <AdUnit placement="article_sidebar" />
                        <RelatedStories posts={trendingPosts} />
                    </div>
                </aside>
            </div>
        </article>
    )
}
