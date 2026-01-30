import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/lib/env'
import { NextResponse } from 'next/server'

export async function GET() {
    const baseUrl = getSiteUrl()
    const supabase = await createClient()

    // Fetch posts from the last 48 hours (Google News requirement)
    const twoDaysAgo = new Date()
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48)

    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, title, published_at, category, tags')
        .eq('status', 'published')
        .gte('published_at', twoDaysAgo.toISOString())
        .order('published_at', { ascending: false })
        .limit(1000)

    if (error) {
        console.error('News Sitemap: Error fetching posts', error)
    }

    const newsItems = (posts || []).map((post: any) => {
        // Escape tags for XML safety
        const escapedKeywords = post.tags && post.tags.length > 0
            ? post.tags.map((tag: string) => escapeXml(tag)).join(', ')
            : null

        return `
    <url>
      <loc>${baseUrl}/news/${post.slug}</loc>
      <news:news>
        <news:publication>
          <news:name>Inshort</news:name>
          <news:language>bn</news:language>
        </news:publication>
        <news:publication_date>${post.published_at}</news:publication_date>
        <news:title>${escapeXml(post.title)}</news:title>
        ${escapedKeywords ? `<news:keywords>${escapedKeywords}</news:keywords>` : ''}
      </news:news>
    </url>`
    }).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsItems}
</urlset>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    })
}

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}
