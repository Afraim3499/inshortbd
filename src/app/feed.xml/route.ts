import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/lib/env'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

// Define extensions for HTML generation
const extensions = [
  StarterKit,
  Image,
  Link,
  Youtube,
  Table,
  TableRow,
  TableCell,
  TableHeader,
]

export async function GET(request: Request) {
  const supabase = await createClient()
  const siteUrl = getSiteUrl()

  // 1. Check If-Modified-Since Header
  const ifModifiedSince = request.headers.get('If-Modified-Since')

  // 2. Fetch Latest Post Date only (Lightweight query)
  if (ifModifiedSince) {
    const { data: latestPost } = await (supabase
      .from('posts') as any)
      .select('published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (latestPost && latestPost.published_at) {
      const lastModified = new Date(latestPost.published_at)
      const ifModifiedDate = new Date(ifModifiedSince)

      // Round to seconds to avoid millisecond mismatches
      if (lastModified.getTime() <= ifModifiedDate.getTime()) {
        return new NextResponse(null, { status: 304 })
      }
    }
  }

  const { data: posts, error } = await (supabase
    .from('posts') as any)
    .select('id, title, slug, excerpt, published_at, category, content, featured_image_url')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) {
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }

  const typedPosts = (posts || []) as any[]

  const rssItems = typedPosts
    .map((post: any) => {
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString()

      const fullUrl = `${siteUrl}/news/${post.slug}`
      const imageUrl = post.featured_image_url
        ? post.featured_image_url.startsWith('http')
          ? post.featured_image_url
          : `${siteUrl}${post.featured_image_url}`
        : null

      // Generate HTML content from TipTap JSON
      let contentHtml = ''
      try {
        if (post.content) {
          contentHtml = generateHTML(post.content, extensions)
        }
      } catch (e) {
        console.error(`Error generating HTML for post ${post.slug}:`, e)
        contentHtml = post.excerpt || ''
      }

      return `
    <item>
      <title><![CDATA[${escapeXml(post.title)}]]></title>
      <link>${fullUrl}</link>
      <guid isPermaLink="true">${fullUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${escapeXml(post.excerpt || '')}]]></description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <category>${escapeXml(post.category)}</category>
      <dc:creator>Inshort Editorial Board</dc:creator>
      ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ''}
    </item>`
    })
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Inshort</title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />
    <description>Concise. Accurate. Breaking. Global news for the modern reader.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>editor@inshortbd.com (Inshort Editorial Team)</managingEditor>
    <webMaster>tech@inshortbd.com (Inshort Tech Team)</webMaster>
    ${rssItems}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      'Last-Modified': new Date().toUTCString(),
    },
  })
}

function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

