import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Clock, Calendar, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Navigation } from '@/components/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: collection } = await (supabase
    .from('collections') as any)
    .select('title, description')
    .eq('slug', slug)
    .single()

  if (!collection) {
    return {
      title: 'Collection Not Found - Inshort',
    }
  }

  const typedCollection = collection as any
  return {
    title: `${typedCollection.title} - Collections | Inshort`,
    description: typedCollection.description || `Explore ${typedCollection.title} collection on Inshort`,
    openGraph: {
      title: typedCollection.title,
      description: typedCollection.description || '',
      type: 'website',
    },
  }
}

async function getCollection(slug: string) {
  const supabase = await createClient()

  const { data: collection, error } = await (supabase
    .from('collections') as any)
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !collection) {
    console.error('getCollection Error:', error)
    return { error, notFound: true }
  }

  return collection as any
}

async function getCollectionPosts(collectionId: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('collection_posts') as any)
    .select(
      `
      order_index,
      posts (
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        published_at,
        views,
        category,
        status,
        readability_score
      )
    `
    )
    .eq('collection_id', collectionId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching collection posts:', error)
    return []
  }

  // Filter out null posts (deleted posts)
  return (data || []).filter((item: any) => item.posts).map((item: any) => ({
    ...item.posts,
    order_index: item.order_index,
  }))
}

// Enable ISR: revalidate every 60 seconds
export const revalidate = 60

import {
  CollectionPageStructuredData,
  BreadcrumbStructuredData,
} from '@/components/structured-data'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { getSiteUrl } from '@/lib/env'

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collectionOrError = await getCollection(slug)

  if ((collectionOrError as any).notFound) {
    return notFound()
  }

  const collection = collectionOrError
  const posts = await getCollectionPosts(collection.id)
  const siteUrl = getSiteUrl()

  const publishedPosts = posts.filter(
    (post: any) => post && post.status === 'published'
  )

  const isSeries = publishedPosts.length > 1 && publishedPosts.some((post: any, index: number) => {
    const prev = publishedPosts[index - 1]
    return prev && post.order_index !== undefined && prev.order_index !== undefined
  })

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <CollectionPageStructuredData
        name={`${collection.title} - Inshort`}
        description={collection.description || `Explore ${collection.title} on Inshort`}
        url={`/collections/${slug}`}
        siteUrl={siteUrl}
        hasPart={publishedPosts.map((p: any) => `/news/${p.slug}`)}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/archive' },
          { name: collection.title, url: `/collections/${slug}` }
        ]}
        siteUrl={siteUrl}
      />
      <Navigation />
      {/* 1. Immersive Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax-like fixity or just absolute */}
        {collection.featured_image_url ? (
          <div className="absolute inset-0 z-0">
            <NewsImage
              src={collection.featured_image_url}
              alt={collection.title}
              fill
              className="object-cover opacity-90"
              priority
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-muted" />
        )}

        {/* Content */}
        <div className="relative z-10 container max-w-4xl mx-auto px-4 text-center mt-12 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-200 hover:text-white mb-6 transition-colors bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="max-w-4xl mx-auto mb-8">
            <Breadcrumbs
              items={[
                { label: 'Collections', href: '/archive' },
                { label: collection.title, href: `/collections/${slug}` },
              ]}
              className="text-gray-200 mb-0"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-medium text-accent mb-4 tracking-wider uppercase">
            <BookOpen className="h-4 w-4" />
            <span>{isSeries ? 'Editorial Series' : 'Curated Collection'}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {collection.title}
          </h1>

          {collection.description && (
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              {collection.description}
            </p>
          )}

          <div className="mt-8 text-sm text-gray-300">
            {publishedPosts.length} Articles &bull; Updated {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="container max-w-6xl mx-auto px-4 -mt-12 relative z-20">

        {publishedPosts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-lg">
            <p className="text-muted-foreground text-lg">Coming soon. No articles published yet.</p>
          </div>
        ) : isSeries ? (
          /* --- COMPACT TIMELINE LAYOUT (Refined) --- */
          <div className="relative py-12">

            {/* Vertical Line - Centered on Desktop, Left on Mobile */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />

            <div className="space-y-12">
              {publishedPosts.map((post: any, index: number) => {
                const isEven = index % 2 === 0;

                return (
                  <div key={post.id} className={cn(
                    "relative flex flex-col md:flex-row items-center",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}>

                    {/* Timeline Node/Marker */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background z-10 shadow-sm" />

                    {/* Spacer for the other side on desktop */}
                    <div className="hidden md:block md:w-1/2" />

                    {/* Content Card */}
                    <div className={cn(
                      "w-full md:w-[calc(50%-2rem)] pl-16 md:pl-0", // Mobile: Left padding
                      isEven ? "md:mr-auto md:pr-8 md:text-right" : "md:ml-auto md:pl-8 md:text-left"
                    )}>
                      <Link
                        href={`/news/${post.slug}`}
                        className={cn(
                          "group flex flex-col gap-4 transition-all",
                          // On desktop, row reverse for even items to keep image near center line? 
                          // No, let's keep it simple: Image on top for small cards OR Horizontal card.
                          // User wanted "Timeline just". Let's do horizontal compact.
                          isEven ? "md:flex-row-reverse" : "md:flex-row"
                        )}
                      >
                        {/* Small Thumbnail */}
                        <div className="relative w-full md:w-48 aspect-[3/2] shrink-0 rounded-lg overflow-hidden border border-border/50 shadow-sm group-hover:shadow-md transition-shadow">
                          {post.featured_image_url ? (
                            <NewsImage
                              src={post.featured_image_url}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 py-2">
                          <div className={cn(
                            "flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-wider mb-2",
                            isEven ? "md:justify-end" : "md:justify-start"
                          )}>
                            <span>Part {index + 1}</span>
                            <span className="w-4 h-px bg-accent/50" />
                            <span>{post.category}</span>
                          </div>

                          <h2 className="text-xl md:text-2xl font-heading font-bold mb-2 group-hover:text-accent transition-colors leading-tight">
                            {post.title}
                          </h2>

                          <p className="text-muted-foreground text-sm line-clamp-2 md:line-clamp-3 leading-relaxed mb-3">
                            {post.excerpt}
                          </p>

                          <div className={cn(
                            "flex items-center gap-3 text-xs text-muted-foreground",
                            isEven ? "md:justify-end" : "md:justify-start"
                          )}>
                            <span className="opacity-70">{formatDate(post.published_at)}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* End Node */}
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 bottom-0 w-3 h-3 rounded-full bg-border" />
          </div>
        ) : (
          /* --- GRID LAYOUT (For Non-Series) --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
            {publishedPosts.map((post: any) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[3/2] overflow-hidden">
                  {post.featured_image_url && (
                    <NewsImage
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm">
                    {post.category}
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col">
                  <h2 className="text-xl font-heading font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.published_at)}</span>
                    <span className="flex items-center gap-1 text-accent font-medium">বিস্তারিত পড়ুন <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
