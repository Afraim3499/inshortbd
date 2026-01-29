import { createClient } from '@/utils/supabase/server'
import { ViewTracker } from '@/components/view-tracker'
import { ArticleTracker } from '@/components/analytics/article-tracker'
import { GoogleNewsScript } from '@/components/analytics/google-news-script'
import {
  ArticleStructuredData,
  BreadcrumbStructuredData,
} from '@/components/structured-data'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { ReadingProgress } from '@/components/reading-progress'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AdUnit } from '@/components/ads/ad-unit'
import { RelatedStories } from '@/components/news/related-stories'
import { getTrendingPosts } from '@/components/trending-posts'
import { ArticleFeed } from '@/components/article/article-feed'
import { getSiteUrl } from '@/lib/env'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { processHtmlContent } from '@/lib/markdown'
import { sanitizeHtml } from '@/lib/sanitize'

async function getPost(slug: string) {
  const supabase = await createClient()
  const { data, error } = await (supabase
    .from('posts') as any)
    .select('*, author:profiles(full_name, email, role, avatar_url)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data as any
}

// Helper to resolve author name from the relation or direct column
function resolveAuthorName(post: any) {
  // 1. If we have a joined author profile (from new author_id relation)
  if (post.author?.full_name) return post.author.full_name

  // 2. Fallback to the legacy 'author_name' column (manual override)
  if (post.author_name) return post.author_name

  // 3. Last resort
  return 'ইনশর্ট টিম'
}

async function getAllPostSlugs() {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase
      .from('posts') as any)
      .select('slug')
      .eq('status', 'published')

    if (error) {
      console.error('Error fetching post slugs:', error)
      return []
    }

    const typedData = (data || []) as Array<{ slug: string }>
    return typedData.map((post: any) => ({ slug: post.slug }))
  } catch (error) {
    console.warn('Could not fetch post slugs for static generation:', error)
    return []
  }
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs
}

// Enable ISR: revalidate every 60 seconds
export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getPost(resolvedParams.slug)

  if (!post) {
    return {
      title: 'Article Not Found',
    }
  }

  const siteUrl = getSiteUrl()
  const canonicalUrl = `${siteUrl}/news/${post.slug}`
  const authorName = resolveAuthorName(post)

  // Build full image URL if needed
  let imageUrl = post.featured_image_url
  if (imageUrl && !imageUrl.startsWith('http')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const cleanUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
      const path = cleanUrl.startsWith('news-images/') ? cleanUrl : `news-images/${cleanUrl}`
      imageUrl = `${supabaseUrl}/storage/v1/object/public/${path}`
    }
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: canonicalUrl,
      siteName: 'ইনশর্ট',
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: authorName ? [authorName] : undefined,
      section: post.category,
      tags: post.tags || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: imageUrl ? [imageUrl] : [],
      creator: '@InshortBD',
    },
  }
}



import { extractTakeawaysFromContent } from '@/lib/extract-takeaways'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const post = await getPost(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  // Fetch Author and Trending data
  const authorName = resolveAuthorName(post)
  const trending = await getTrendingPosts()
  const siteUrl = getSiteUrl()

  // Key Takeaways Logic: DB > Fallback Extraction
  const dbTakeaways = (post as any).key_takeaways as string[] | null
  const keyTakeaways = dbTakeaways && dbTakeaways.length > 0
    ? dbTakeaways
    : extractTakeawaysFromContent(post.content as string) // Fallback

  return (
    <>
      <ArticleStructuredData
        post={post as any}
        authorName={authorName}
        siteUrl={siteUrl}
        mentions={(post as any).mentions}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: post.category, url: `/category/${encodeURIComponent(post.category)}` },
          { name: post.title, url: `/news/${post.slug}` },
        ]}
        siteUrl={siteUrl}
      />
      <Navigation />
      <ReadingProgress />
      <ViewTracker postId={post.id} />
      <ArticleTracker postId={post.id} />
      <GoogleNewsScript />

      <main id="main-content" tabIndex={-1} className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ArticleFeed
            initialPost={{ ...post, key_takeaways: keyTakeaways }}
            authorName={authorName}
            trendingPosts={trending}
          />
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
