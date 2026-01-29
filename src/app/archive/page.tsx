import { createClient } from '@/utils/supabase/server'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/env'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Archives',
  description: 'Browse articles by month and year',
  alternates: {
    canonical: `${getSiteUrl()}/archive`,
  },
}

async function getAvailableMonths() {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('posts') as any)
    .select('published_at')
    .eq('status', 'published')
    .not('published_at', 'is', null)

  if (error || !data) {
    return []
  }

  // Group by year and month
  const grouped: Record<number, Record<number, number>> = {}
  const typedData = (data || []) as any[]

  typedData.forEach((post: any) => {
    if (post && post.published_at) {
      const date = new Date(post.published_at)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      if (!grouped[year]) {
        grouped[year] = {}
      }
      grouped[year][month] = (grouped[year][month] || 0) + 1
    }
  })

  // Convert to array and sort
  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)
    .map((year) => {
      const months = Object.entries(grouped[year])
        .map(([month, count]) => ({
          month: parseInt(month),
          count,
        }))
        .sort((a, b) => b.month - a.month)

      return { year, months }
    })

  return years
}

export default async function ArchiveIndexPage() {
  const archives = await getAvailableMonths()

  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">Archives</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Browse articles by month and year
          </p>

          {archives.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No archived articles yet.
            </div>
          ) : (
            <div className="space-y-8">
              {archives.map(({ year, months }) => (
                <div key={year}>
                  <h2 className="text-2xl font-heading font-bold mb-4">{year}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {months.map(({ month, count }) => {
                      const monthName = new Date(year, month - 1).toLocaleString('default', {
                        month: 'long',
                      })
                      return (
                        <Link
                          key={month}
                          href={`/archive/${year}/${month}`}
                          className="p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-colors group"
                        >
                          <div className="font-medium group-hover:text-accent transition-colors">
                            {monthName}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 font-mono">
                            {count} {count === 1 ? 'article' : 'articles'}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

