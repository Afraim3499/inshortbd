import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { NewsImage } from '@/components/news-image'
import { SearchBar } from '@/components/search-bar'

async function getPopularArticles() {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('posts') as any)
    .select('id, title, slug, excerpt, featured_image_url, views')
    .eq('status', 'published')
    .order('views', { ascending: false, nullsFirst: false })
    .limit(6)

  if (error) {
    // console.warn('Failed to load popular articles in 404 (likely empty table or RLS)')
    return []
  }

  return (data || []) as any[]
}

export default async function NotFound() {
  const popularArticles = await getPopularArticles()

  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-4">
              <h1 className="text-8xl font-heading font-bold text-accent">404</h1>
              <h2 className="text-3xl font-heading font-bold">পাতাটি খুঁজে পাওয়া যায়নি</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                আপনি যে পাতাটি খুঁজছেন তা নেই। এটি সম্ভবত সরিয়ে ফেলা হয়েছে বা এর নাম পরিবর্তন করা হয়েছে।
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto pt-4">
              <SearchBar />
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-colors"
              >
                নীড়পাতায় ফিরে যান
              </Link>
            </div>
          </div>

          {/* Popular Articles */}
          {popularArticles.length > 0 && (
            <div className="border-t border-border pt-12">
              <h3 className="text-2xl font-heading font-bold mb-6">
                জনপ্রিয় সংবাদসমূহ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularArticles.map((article: any) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="group block border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
                  >
                    {article.featured_image_url && (
                      <div className="relative w-full h-40 overflow-hidden">
                        <NewsImage
                          src={article.featured_image_url}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-heading font-bold group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      {article.views !== null && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {article.views.toLocaleString('bn-BD')} বার পঠিত
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
