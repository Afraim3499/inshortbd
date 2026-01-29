import { getAnalyticsData } from '@/lib/analytics'
import { getEnhancedAnalyticsData } from '@/lib/analytics/enhanced'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, FileText, TrendingUp, User } from 'lucide-react'
import Link from 'next/link'
import { EnhancedDashboard } from '@/components/analytics/enhanced-dashboard'
import { CampaignsDashboard } from '@/components/analytics/campaigns-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function AnalyticsPage() {
  const [basicData, enhancedData] = await Promise.all([
    getAnalyticsData(),
    getEnhancedAnalyticsData().catch(() => null), // Gracefully handle if tables don't exist yet
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Analytics Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Basic Analytics */}
        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{basicData.totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{basicData.totalArticles}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Views/Article</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{basicData.averageViews.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Authors</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{basicData.authorPerformance.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {basicData.topArticles.length > 0 ? (
                  basicData.topArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/admin/editor?id=${article.id}`}
                            className="font-medium hover:text-accent transition-colors"
                          >
                            {article.title}
                          </Link>
                          <div className="text-sm text-muted-foreground mt-1">
                            {article.category} • {new Date(article.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{article.views?.toLocaleString() || 0}</div>
                        <div className="text-xs text-muted-foreground">views</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No articles published yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {basicData.categoryPerformance.length > 0 ? (
                    basicData.categoryPerformance.map((cat) => (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{cat.category}</span>
                          <span className="text-sm text-muted-foreground">
                            {cat.totalViews.toLocaleString()} views
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{cat.count} articles</span>
                          <span>•</span>
                          <span>Avg: {cat.averageViews.toLocaleString()} views</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-accent h-full transition-all"
                            style={{
                              width: `${
                                basicData.totalViews > 0
                                  ? (cat.totalViews / basicData.totalViews) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No category data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Author Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Author Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {basicData.authorPerformance.length > 0 ? (
                    basicData.authorPerformance.map((author) => (
                      <div key={author.authorId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {author.authorName || 'Unknown Author'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {author.totalViews.toLocaleString()} views
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{author.articleCount} articles</span>
                          <span>•</span>
                          <span>Avg: {author.averageViews.toLocaleString()} views</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-accent h-full transition-all"
                            style={{
                              width: `${
                                basicData.totalViews > 0
                                  ? (author.totalViews / basicData.totalViews) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No author data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab - Enhanced Analytics */}
        <TabsContent value="engagement" className="space-y-6">
          {enhancedData ? (
            <EnhancedDashboard initialData={enhancedData} />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Enhanced analytics require database migration.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Run <code className="bg-muted px-2 py-1 rounded">database/analytics-migration.sql</code> in
                    Supabase to enable engagement tracking.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <CampaignsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
