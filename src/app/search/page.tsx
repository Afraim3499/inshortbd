'use client'

import { useState, useEffect, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { NewsImage } from '@/components/news-image'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { Pagination } from '@/components/pagination'
import { EmptyState } from '@/components/empty-state'
import { ArticleCardSkeleton } from '@/components/article-card-skeleton'
import Link from 'next/link'
import { useDebounce } from '@/hooks/use-debounce'
import { useTags } from '@/hooks/useTags'
import { sanitizeSearchQuery, buildSearchFilter } from '@/lib/search-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { generateText } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const POSTS_PER_PAGE = 20

const CATEGORIES = ['All', 'Politics', 'Tech', 'Culture', 'Business', 'World']
const SORT_OPTIONS = [
  { value: 'newest', label: 'সাম্প্রতিক আগে' },
  { value: 'oldest', label: 'পুরানো আগে' },
  { value: 'views', label: 'সর্বোচ্চ পঠিত' },
  { value: 'relevance', label: 'প্রাসঙ্গিকতা' },
]

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'All')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const currentPage = parseInt(searchParams.get('page') || '1', 10) || 1

  const debouncedQuery = useDebounce(searchQuery, 300)
  const supabase = createClient()
  const { data: availableTags = [] } = useTags()

  // Update URL when filters change
  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'All' && key !== 'page') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    // Reset to page 1 when filters change (unless it's page change)
    if (!updates.page) {
      params.delete('page')
    }
    router.push(`/search?${params.toString()}`)
  }

  // Helper function to extract text from Tiptap JSONB content
  const extractTextFromContent = (content: any): string => {
    if (!content) return ''
    try {
      return generateText(content, [StarterKit])
    } catch {
      return ''
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['search-posts', debouncedQuery, selectedCategory, selectedTag, sortBy, currentPage],
    queryFn: async () => {
      let query = (supabase
        .from('posts') as any)
        .select('*', { count: 'exact' })
        .eq('status', 'published')

      // Category filter
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory)
      }

      // Tag filter
      if (selectedTag !== 'All') {
        query = query.contains('tags', [selectedTag])
      }

      // Search in title, excerpt, and content
      if (debouncedQuery.trim()) {
        const sanitizedQuery = sanitizeSearchQuery(debouncedQuery)
        if (sanitizedQuery) {
          const searchFilter = buildSearchFilter(sanitizedQuery, ['title', 'excerpt'])
          if (searchFilter) {
            query = query.or(searchFilter)
          }
        }
      }

      // Sorting
      if (sortBy === 'newest') {
        query = query.order('published_at', { ascending: false })
      } else if (sortBy === 'oldest') {
        query = query.order('published_at', { ascending: true })
      } else if (sortBy === 'views') {
        query = query.order('views', { ascending: false, nullsFirst: false })
      } else {
        query = query.order('published_at', { ascending: false })
      }

      // Pagination
      const from = (currentPage - 1) * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1
      const { data: posts, error, count } = await query.range(from, to)

      if (error) throw error

      // Client-side content search and relevance scoring
      const typedPosts = (posts || []) as any[]
      let finalPosts: any[] = typedPosts
      if (debouncedQuery && typedPosts.length > 0) {
        const queryLower = debouncedQuery.toLowerCase()
        finalPosts = typedPosts.map((post: any) => {
          let score = 0
          if (post.title?.toLowerCase().includes(queryLower)) score += 10
          if (post.excerpt?.toLowerCase().includes(queryLower)) score += 5

          // Search in content by extracting text
          const contentText = extractTextFromContent(post.content)
          if (contentText.toLowerCase().includes(queryLower)) {
            score += 3
          }

          return { ...post, score }
        })

        // Sort by relevance if selected
        if (sortBy === 'relevance') {
          finalPosts.sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
        }
      }

      return { posts: finalPosts, total: count || 0 }
    },
  })

  const posts = data?.posts || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)

  // Sync URL params when debounced query changes (but not on initial mount)
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    if (debouncedQuery && debouncedQuery !== urlQuery) {
      updateUrl({ q: debouncedQuery })
    }
  }, [debouncedQuery])

  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-4">
              {searchQuery ? `"${searchQuery}"-এর জন্য অনুসন্ধানের ফলাফল` : 'নিবন্ধ অনুসন্ধান করুন'}
            </h1>
            <div className="space-y-4">
              <Input
                type="search"
                placeholder="শিরোনাম, উদ্ধৃতি বা বিষয়বস্তু দিয়ে অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg"
              />
              <div className="flex gap-4 flex-wrap">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    updateUrl({ category: value })
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="বিভাগ" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedTag}
                  onValueChange={(value) => {
                    setSelectedTag(value)
                    updateUrl({ tag: value })
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ট্যাগ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">সব ট্যাগ</SelectItem>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value)
                    updateUrl({ sort: value })
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="সাজান" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {total.toLocaleString('bn-BD')}টি খবর পাওয়া গিয়েছে
                {totalPages > 1 && ` (${currentPage.toLocaleString('bn-BD')} পাতা, মোট ${totalPages.toLocaleString('bn-BD')} পাতা)`}
              </p>
              {posts.map((post: any) => (
                <article
                  key={post.id}
                  className="grid md:grid-cols-3 gap-6 group border-b border-border pb-6 last:border-0"
                >
                  <Link href={`/news/${post.slug}`}>
                    <div className="aspect-video rounded-md md:col-span-1 border border-border/50 overflow-hidden relative">
                      <NewsImage
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <span className="text-accent uppercase">{post.category}</span>
                      {post.published_at && (
                        <>
                          <span>�</span>
                          <span>
                            {new Date(post.published_at).toLocaleDateString('bn-BD')}
                          </span>
                        </>
                      )}
                      {post.views !== null && (
                        <>
                          <span>�</span>
                          <span>{post.views.toLocaleString('bn-BD')} বার পঠিত</span>
                        </>
                      )}
                    </div>
                    <Link href={`/news/${post.slug}`}>
                      <h2 className="text-2xl font-heading font-bold group-hover:text-accent transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt && (
                      <p className="text-muted-foreground">{post.excerpt}</p>
                    )}
                    {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag: string) => (
                          <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
                            <Badge variant="secondary" className="text-xs hover:bg-accent cursor-pointer">
                              {tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-8 border-t border-border">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/search"
                    searchParams={{
                      q: searchQuery,
                      category: selectedCategory,
                      tag: selectedTag,
                      sort: sortBy,
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              type="search"
              title={
                debouncedQuery || selectedCategory !== 'All' || selectedTag !== 'All'
                  ? 'কোনো ফলাফল পাওয়া যায়নি'
                  : 'অনুসন্ধান শুরু করুন'
              }
              description={
                debouncedQuery || selectedCategory !== 'All' || selectedTag !== 'All'
                  ? 'আপনার অনুসন্ধানের শব্দ বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।'
                  : 'খবর খুঁজতে শব্দ টাইপ করুন, অথবা বিভাগ বা ট্যাগ অনুসারে ফিল্টার ব্যবহার করুন।'
              }
              action={
                debouncedQuery || selectedCategory !== 'All' || selectedTag !== 'All'
                  ? undefined
                  : {
                    label: 'বিভাগসমূহ দেখুন',
                    href: '/category/Politics',
                  }
              }
            />
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <>
        <Navigation />
        <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
        <BackToTop />
      </>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
