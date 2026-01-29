import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { AdUnit } from '@/components/ads/ad-unit'
import { createClient } from '@/utils/supabase/server'

interface Post {
    id: string
    title: string
    slug: string
    views?: number | null
    category?: string
    published_at?: string
    featured_image_url?: string
}



interface RightSidebarProps {
    popularPosts: Post[]
    trendingPosts: Post[]
}

async function getLiveUpdates() {
    try {
        const supabase = await createClient()
        // Use 'as any' to bypass strict type check if types aren't fully synced yet
        const { data, error } = await (supabase
            .from('live_updates') as any)
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) {
            // Silently fail or warn, but don't crash the sidebar
            // console.warn('Error fetching live updates (table might be missing):', error.message)
            return []
        }
        return data || []
    } catch (err) {
        console.error('Unexpected error fetching live updates:', err)
        return []
    }
}

export async function RightSidebar({ popularPosts, trendingPosts }: RightSidebarProps) {
    const liveUpdates = await getLiveUpdates()

    // Fetch all published posts categories to count them
    const { data: allPosts } = await (await createClient())
        .from('posts')
        .select('category')
        .eq('status', 'published')

    // Aggregate counts
    const categoryCounts: Record<string, number> = {}
    allPosts?.forEach((post: any) => {
        const cat = post.category || 'Uncategorized'
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })

    // Define standard categories and their colors (fallback for others)
    const colorMap: Record<string, string> = {
        'politics': 'bg-red-500',
        'technology': 'bg-purple-500',
        'tech': 'bg-purple-500',
        'culture': 'bg-orange-500',
        'finance': 'bg-green-500',
        'world': 'bg-blue-500',
        'markets': 'bg-emerald-500',
        'entertainment': 'bg-pink-500',
        'science': 'bg-cyan-500',
        'health': 'bg-teal-500',
        'sports': 'bg-green-600',
    }

    // Convert to array and sort by count
    const categories = Object.entries(categoryCounts)
        .map(([name, count]) => {
            // Sanitize slug: lowercase, replace spaces/slashes with hyphens, remove special chars
            const slug = name.toLowerCase()
                .replace(/\s*\/\s*/g, '-') // "Culture / Media" -> "culture-media"
                .replace(/\s+/g, '-')       // spaces -> hyphens
                .replace(/[^a-z0-9-]/g, '') // remove special chars
            const color = colorMap[slug] || 'bg-gray-500' // Default color
            return { name, count, slug, color }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Top 8 categories

    return (
        <aside className="col-span-12 lg:col-span-3 space-y-6 order-2 lg:order-3">
            {/* Trending Now - High Velocity Content */}
            <div className="bg-white border border-card-border rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-ink-black mb-4 flex items-center gap-2 font-sans">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    আলোচিত সংবাদ
                </h3>
                <div className="space-y-4">
                    {trendingPosts.map((post, index) => (
                        <Link key={post.id} href={`/news/${post.slug}`} className="group block text-left">
                            <div className="flex gap-3">
                                <span className="text-2xl font-black text-gray-200 group-hover:text-blood-red font-display transition-colors w-6 text-center">{index + 1}</span>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-ink-black group-hover:text-blood-red leading-tight mb-1 font-sans transition-colors line-clamp-2">
                                        {post.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-meta-gray font-mono">
                                        <span className="flex items-center gap-1">
                                            {post.views?.toLocaleString('bn-BD')}বার পঠিত
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {trendingPosts.length === 0 && <p className="text-sm text-gray-500">আপাতত কোনো আলোচিত সংবাদ নেই।</p>}
                </div>
            </div>
            {/* Most Popular */}
            <div className="bg-white border border-card-border rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-ink-black mb-4 flex items-center gap-2 font-sans">
                    🔥 আজকের সেরা
                </h3>
                <div className="space-y-5">
                    {popularPosts.map((post, index) => (
                        <div key={post.id} className={index > 0 ? 'pt-4 border-t border-gray-100' : ''}>
                            {index === 0 ? (
                                <Link href={`/news/${post.slug}`} className="group block">
                                    <div className="aspect-video rounded-lg overflow-hidden mb-2 relative">
                                        <NewsImage
                                            src={post.featured_image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h4 className="text-sm font-bold text-ink-black leading-tight group-hover:text-blood-red mb-1 font-sans transition-colors">
                                        {post.title}
                                    </h4>
                                </Link>
                            ) : (
                                <Link href={`/news/${post.slug}`} className="group block">
                                    <h4 className="text-sm font-semibold text-ink-black leading-tight group-hover:text-blood-red mb-2 font-sans transition-colors line-clamp-2">
                                        {post.title}
                                    </h4>
                                </Link>
                            )}
                            <div className="flex items-center gap-2 text-xs text-meta-gray font-mono">
                                <span>{post.views?.toLocaleString('bn-BD')} বার পঠিত</span>
                                {post.published_at && (
                                    <>
                                        <span>•</span>
                                        <span suppressHydrationWarning>{new Date(post.published_at).toLocaleDateString('bn-BD')}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {popularPosts.length === 0 && <p className="text-sm text-gray-500">কোনো জনপ্রিয় খবর নেই।</p>}
                </div>
            </div>



            {/* Live Updates */}
            {liveUpdates.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-red-600 mb-4 flex items-center gap-2 font-sans">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        লাইভ আপডেট
                    </h3>
                    <div className="space-y-3 text-sm font-sans">
                        {liveUpdates.map((update: any) => (
                            <div key={update.id} className="flex gap-2 items-start">
                                <span className="text-xs text-red-600 font-bold font-mono pt-1">
                                    {new Date(update.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <p className="flex-1 text-gray-700 leading-snug">{update.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="bg-soft-wash rounded-xl p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-ink-black mb-3 font-sans">বিভাগসমূহ</h3>
                <div className="space-y-2">
                    {categories.map(cat => (
                        <Link key={cat.slug} href={`/category/${cat.slug}`} className="flex items-center justify-between py-2 text-sm hover:text-blood-red transition-colors group">
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`}></span>
                                <span className="font-medium text-gray-700 group-hover:text-blood-red">{cat.name}</span>
                            </div>
                            <span className="text-xs text-meta-gray">{cat.count.toLocaleString('bn-BD')}টি খবর</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Ad Space */}
            <AdUnit placement="homepage_sidebar" />
        </aside>
    )
}
