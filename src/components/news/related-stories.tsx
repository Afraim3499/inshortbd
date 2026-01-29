import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Post {
    id: string
    title: string
    slug: string
    category?: string
}

export function RelatedStories({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null

    return (
        <div className="bg-white border text-gray-900 border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 font-sans">
                Read Next
            </h3>
            <div className="space-y-4">
                {posts.slice(0, 4).map((post) => (
                    <Link key={post.id} href={`/news/${post.slug}`} className="group block">
                        <span className="text-xs font-bold text-primary mb-1 block uppercase">{post.category || 'News'}</span>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary leading-snug font-sans transition-colors">
                            {post.title}
                        </h4>
                    </Link>
                ))}
            </div>
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-4 hover:underline">
                View Homepage <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    )
}
