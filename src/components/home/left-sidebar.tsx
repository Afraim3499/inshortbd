'use client'

import Link from 'next/link'

import { NewsImage } from '@/components/news-image'

interface Post {
    id: string
    title: string
    slug: string
    views?: number | null
    category?: string
    published_at?: string
    featured_image_url?: string
}

interface Collection {
    id: string
    title: string
    slug: string
    featured_image_url?: string | null
}

interface LeftSidebarProps {
    collections: Collection[]
    editorsPicks: Post[]
}

export function LeftSidebar({ collections, editorsPicks }: LeftSidebarProps) {
    return (
        <aside className="col-span-12 lg:col-span-3 space-y-6 order-3 lg:order-1">
            {/* Featured Series / Collections */}
            {collections && collections.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-white shadow-xl">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2 font-sans">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        গভীর বিশ্লেষণাত্মক সিরিজ
                    </h3>
                    <div className="space-y-4">
                        {collections.map(collection => (
                            <Link key={collection.id} href={`/collections/${collection.slug}`} className="group flex gap-3 items-center">
                                <div className="h-16 w-16 relative rounded-md overflow-hidden shrink-0 border border-zinc-700">
                                    <NewsImage
                                        src={collection.featured_image_url}
                                        alt={collection.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-tight block mb-0.5">
                                        সিরিজ
                                    </span>
                                    <h4 className="text-sm font-bold text-zinc-100 group-hover:text-blue-400 leading-tight transition-colors line-clamp-2">
                                        {collection.title}
                                    </h4>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Editor's Picks */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-primary mb-4 font-sans">
                    সম্পাদকের বাছাই
                </h3>
                <div className="space-y-4">
                    {editorsPicks.map(post => (
                        <Link key={post.id} href={`/news/${post.slug}`} className="group block">
                            <div className="aspect-video rounded-lg overflow-hidden mb-2 relative">
                                <NewsImage
                                    src={post.featured_image_url}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <h4 className="text-sm font-bold text-ink-black group-hover:text-blood-red leading-tight font-sans transition-colors line-clamp-2">
                                {post.title}
                            </h4>
                            <p className="text-xs text-meta-gray mt-1 font-sans">গভীর বিশ্লেষণ</p>
                        </Link>
                    ))}
                    {editorsPicks.length === 0 && <p className="text-sm text-gray-500">কোনো বাছাই নেই।</p>}
                </div>
            </div>

            {/* Newsletter */}
            <div className="bg-ink-black text-white rounded-xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-2 font-display">সংবাদ সংক্ষেপ</h3>
                <p className="text-sm text-gray-300 mb-4 font-sans leading-relaxed">প্রতিদিন সকালে শীর্ষ সংবাদগুলো আপনার ইনবক্সে পান।</p>
                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="আপনার ইমেল"
                        className="w-full px-4 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2 rounded-lg text-sm transition-colors font-sans transform hover:scale-[1.02] duration-200">
                        সাবস্ক্রাইব
                    </button>
                </form>
            </div>
        </aside>
    )
}
