import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/lib/env'
import { CATEGORIES } from '@/lib/constants'

export default async function sitemap() {
  const baseUrl = getSiteUrl()
  const supabase = await createClient()

  // 1. Fetch Posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('slug, created_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (postsError) {
    console.error('Sitemap: Error fetching posts', postsError)
  }

  const postUrls = (posts || []).map((post: { slug: string; created_at: string | null; published_at?: string | null }) => {
    const date = post.published_at ? new Date(post.published_at) : (post.created_at ? new Date(post.created_at) : new Date())
    return {
      url: `${baseUrl}/news/${post.slug}`,
      lastModified: date,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }
  })



  // 3. Fetch Tags (distinct from posts)
  const { data: tagData } = await supabase
    .from('posts')
    .select('tags')
    .eq('status', 'published')
    .not('tags', 'is', null)

  const allTags = new Set<string>()
    ; (tagData || []).forEach((post: { tags: string[] | null }) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => allTags.add(tag))
      }
    })

  const tagUrls = Array.from(allTags).map((tag) => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.3,
  }))

  // 4. Fetch Authors (profiles with published posts)
  const { data: authorData } = await supabase
    .from('posts')
    .select('author_id')
    .eq('status', 'published')
    .not('author_id', 'is', null)

  const authorIds = [...new Set((authorData || []).map((p: { author_id: string }) => p.author_id))]

  const authorUrls = authorIds.map((authorId) => ({
    url: `${baseUrl}/author/${authorId}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // 5. Fetch Collections
  const { data: collections } = await supabase
    .from('collections')
    .select('slug, created_at')
    .order('created_at', { ascending: false })

  const collectionUrls = (collections || []).map((collection: { slug: string; created_at: string | null }) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: collection.created_at ? new Date(collection.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

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
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    // Individual archive pages
    ...Array.from(archiveSet).map((yearMonth) => ({
      url: `${baseUrl}/archive/${yearMonth}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    }))
  ]

  // 7. Static Routes
  const staticRoutes = [
    { route: '', priority: 1, changeFrequency: 'daily' as const },
    { route: '/finance', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { route: '/publication-policy', priority: 0.4, changeFrequency: 'yearly' as const },
    { route: '/terms-of-service', priority: 0.4, changeFrequency: 'yearly' as const },
    { route: '/newsletter', priority: 0.6, changeFrequency: 'monthly' as const },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // 8. Categories
  const categoryUrls = CATEGORIES.map((category) => ({
    url: `${baseUrl}/category/${encodeURIComponent(category.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    ...staticRoutes,
    ...categoryUrls,
    ...postUrls,
    ...tagUrls,
    ...authorUrls,
    ...collectionUrls,
    ...archiveUrls,
  ]
}
