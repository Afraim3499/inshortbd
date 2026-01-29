import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Fetch the last 50 published posts
    const { data: posts, error } = await supabase
        .from('posts')
        .select('title, slug, excerpt, published_at, category')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('llms-full.txt: Error fetching posts', error)
        return new NextResponse('Error fetching data', { status: 500 })
    }

    // Build the plain text response
    const header = `# CONTEXT: Live News Feed from Inshort BD
# LOCATION: Dhaka, Bangladesh
# LAST_UPDATED: ${new Date().toISOString()}
# TOTAL_ARTICLES: ${posts?.length || 0}

---

`

    const articles = (posts || []).map((post: { title: string; slug: string; excerpt: string | null; published_at: string | null; category: string | null }, index: number) => {
        const date = post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : 'N/A'
        return `## ${index + 1}. ${post.title}
- **Category:** ${post.category || 'Uncategorized'}
- **Date:** ${date}
- **URL:** https://inshortbd.com/news/${post.slug}
- **Excerpt:** ${post.excerpt || 'No excerpt available.'}
`
    }).join('\n')

    const response = header + articles

    return new NextResponse(response, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}
