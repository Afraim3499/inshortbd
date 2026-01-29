import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/lib/env'
import { CATEGORIES } from '@/lib/constants'

export async function GET() {
  const baseUrl = getSiteUrl()
  const supabase = await createClient()

  // 1. Fetch Posts
  const { data: posts, error: postsError } = await (supabase
    .from('posts') as any)
    .select('slug, created_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (postsError) {
    console.error('Sitemap: Error fetching posts', postsError)
  }

  const postUrls = (posts || []).map((post: { slug: string; created_at: string | null; published_at?: string | null }) => {
    const date = post.published_at ? new Date(post.published_at).toISOString() : (post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString())
    return `
  <url>
    <loc>${baseUrl}/news/${post.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
  })

  // 3. Fetch Tags (distinct from posts)
  const { data: tagData } = await (supabase
    .from('posts') as any)
    .select('tags')
    .eq('status', 'published')
    .not('tags', 'is', null)

  const allTags = new Set<string>()
    ; (tagData || []).forEach((post: { tags: string[] | null }) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => allTags.add(tag))
      }
    })

  const tagUrls = Array.from(allTags).map((tag) => `
  <url>
    <loc>${baseUrl}/tag/${encodeURIComponent(tag)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>`)

  // 4. Fetch Authors (profiles with published posts)
  const { data: authorData } = await (supabase
    .from('posts') as any)
    .select('author_id')
    .eq('status', 'published')
    .not('author_id', 'is', null)

  const authorIds = [...new Set((authorData || []).map((p: { author_id: string }) => p.author_id))]

  const authorUrls = authorIds.map((authorId) => `
  <url>
    <loc>${baseUrl}/author/${authorId}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`)

  // 5. Fetch Collections
  const { data: collections } = await (supabase
    .from('collections') as any)
    .select('slug, created_at')
    .order('created_at', { ascending: false })

  const collectionUrls = (collections || []).map((collection: { slug: string; created_at: string | null }) => `
  <url>
    <loc>${baseUrl}/collections/${collection.slug}</loc>
    <lastmod>${collection.created_at ? new Date(collection.created_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`)

  // 6. Archive pages (by year/month from published posts)
  const archiveSet = new Set<string>()
    ; (posts || []).forEach((post: { published_at?: string | null }) => {
      if (post.published_at) {
        const date = new Date(post.published_at)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        archiveSet.add(`${year}/${month}`)
      }
    })

  const archiveUrls = [
    // Archive index
    `
  <url>
    <loc>${baseUrl}/archive</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>`,
    // Individual archive pages
    ...Array.from(archiveSet).map((yearMonth) => `
  <url>
    <loc>${baseUrl}/archive/${yearMonth}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`)
  ]

  // 7. Static Routes
  const staticRoutes = [
    { route: '', priority: 1, changeFrequency: 'daily' },
    { route: '/finance', priority: 0.9, changeFrequency: 'daily' },
    { route: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { route: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { route: '/publication-policy', priority: 0.4, changeFrequency: 'yearly' },
    { route: '/terms-of-service', priority: 0.4, changeFrequency: 'yearly' },
    { route: '/newsletter', priority: 0.6, changeFrequency: 'monthly' },
  ].map(({ route, priority, changeFrequency }) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`)

  // 8. Categories
  const categoryUrls = CATEGORIES.map((category) => `
  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(category.toLowerCase())}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`)

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.join('')}
  ${categoryUrls.join('')}
  ${postUrls.join('')}
  ${tagUrls.join('')}
  ${authorUrls.join('')}
  ${collectionUrls.join('')}
  ${archiveUrls.join('')}
</urlset>`

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
