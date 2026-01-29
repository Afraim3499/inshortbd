'use client'

import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { ArrowRight } from 'lucide-react'

interface Post {
    id: string
    title: string
    slug: string
    excerpt?: string
    category?: string
    published_at?: string
    featured_image_url?: string
}

interface CategorySectionProps {
    category: string // URL slug (English)
    title?: string   // Display name (Bangla)
    posts: Post[]
    color?: 'blue' | 'purple' | 'orange' | 'green' | 'red'
}

export function CategorySection({ category, title, posts, color = 'blue' }: CategorySectionProps) {
    if (!posts || posts.length === 0) return null

    // Use title for display, fallback to category if not provided
    const displayName = title || category

    const colorStyles = {
        blue: 'text-blue-600 border-blue-600',
        purple: 'text-purple-600 border-purple-600',
        orange: 'text-orange-600 border-orange-600',
        green: 'text-green-600 border-green-600',
        red: 'text-red-600 border-red-600',
    }

    const highlightColor = colorStyles[color] || colorStyles.blue

    return (
        <section className="py-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                    <span className={`w-3 h-8 rounded-sm bg-current ${highlightColor.split(' ')[0]}`}></span>
                    {displayName}
                </h2>
                <Link
                    href={`/category/${encodeURIComponent(category)}`}
                    className="group flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blood-red transition-colors"
                >
                    {displayName}-এর সব দেখুন
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {posts.map((post) => (
                    <article key={post.id} className="group flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <Link href={`/news/${post.slug}`} className="block relative aspect-[3/2] overflow-hidden bg-gray-100">
                            <NewsImage
                                src={post.featured_image_url}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <div className="p-4 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-2">
                                <span suppressHydrationWarning>{post.published_at ? new Date(post.published_at).toLocaleDateString('bn-BD') : 'সাম্প্রতিক'}</span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 leading-snug mb-2 font-display group-hover:text-blood-red transition-colors line-clamp-3">
                                <Link href={`/news/${post.slug}`}>
                                    {post.title}
                                </Link>
                            </h3>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
