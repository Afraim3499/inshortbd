'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useSiteConfig, useUpdateSiteConfig } from '@/hooks/useSiteConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function TrafficPage() {
  const { data: config, isLoading: loadingConfig } = useSiteConfig()
  const updateConfig = useUpdateSiteConfig()
  const supabase = createClient()

  const [heroPostId, setHeroPostId] = useState<string | null>(null)
  const [breakingBannerActive, setBreakingBannerActive] = useState(false)
  const [breakingBannerText, setBreakingBannerText] = useState('')
  const [pinnedPostIds, setPinnedPostIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all published posts for selection
  const { data: posts } = useQuery({
    queryKey: ['all-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as Array<{
        id: string
        title: string
        slug: string
      }>
    },
  })

  // Load config into state
  useEffect(() => {
    if (config) {
      setTimeout(() => {
        setHeroPostId(config.hero_post_id || null)
        setBreakingBannerActive(config.breaking_banner_active || false)
        setBreakingBannerText(config.breaking_banner_text || '')
        setPinnedPostIds(config.pinned_post_ids || [])
      }, 0)
    }
  }, [config])

  const handleSave = () => {
    updateConfig.mutate({
      hero_post_id: heroPostId,
      breaking_banner_active: breakingBannerActive,
      breaking_banner_text: breakingBannerText || null,
      pinned_post_ids: pinnedPostIds.length > 0 ? pinnedPostIds : null,
    })
  }

  const togglePinnedPost = (postId: string) => {
    setPinnedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    )
  }

  const filteredPosts = posts?.filter((post: any) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loadingConfig) {
    return <div className="p-8 text-center">Loading configuration...</div>
  }

  const heroPost = posts?.find((p) => p.id === heroPostId)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Traffic Control</h1>
        <Button onClick={handleSave} disabled={updateConfig.isPending}>
          {updateConfig.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>

      {updateConfig.isSuccess && (
        <Alert>
          <AlertDescription>Configuration saved successfully!</AlertDescription>
        </Alert>
      )}

      {updateConfig.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to save configuration. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {/* Hero Article Selector */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <div>
            <h2 className="text-xl font-heading font-bold mb-2">Hero Article</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select the featured article displayed prominently on the homepage
            </p>
          </div>
          <Select
            value={heroPostId || '_none'}
            onValueChange={(value) => setHeroPostId(value === '_none' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hero article..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None</SelectItem>
              {posts?.map((post) => (
                <SelectItem key={post.id} value={post.id}>
                  {post.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {heroPost && (
            <div className="mt-2 text-sm text-muted-foreground">
              Current: <span className="font-medium">{heroPost.title}</span>
            </div>
          )}
        </div>

        {/* Breaking News Banner */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <div>
            <h2 className="text-xl font-heading font-bold mb-2">Breaking News Banner</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Display an urgent news banner at the top of the homepage
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="breaking-news"
              checked={breakingBannerActive}
              onCheckedChange={setBreakingBannerActive}
            />
            <Label htmlFor="breaking-news" className="cursor-pointer">
              Enable Breaking News Banner
            </Label>
          </div>
          {breakingBannerActive && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="banner-text">Banner Text</Label>
              <Input
                id="banner-text"
                value={breakingBannerText}
                onChange={(e) => setBreakingBannerText(e.target.value)}
                placeholder="Enter breaking news text..."
              />
            </div>
          )}
        </div>

        {/* Trending Posts (Pinned) */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <div>
            <h2 className="text-xl font-heading font-bold mb-2">Trending Posts</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select posts to feature in the sidebar (max 5 recommended)
            </p>
          </div>
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredPosts?.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/5 cursor-pointer"
                onClick={() => togglePinnedPost(post.id)}
              >
                <span className="text-sm">{post.title}</span>
                {pinnedPostIds.includes(post.id) && (
                  <Badge variant="default">Pinned</Badge>
                )}
              </div>
            ))}
          </div>
          {pinnedPostIds.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Selected ({pinnedPostIds.length}):</p>
              <div className="flex flex-wrap gap-2">
                {pinnedPostIds.map((id) => {
                  const post = posts?.find((p) => p.id === id)
                  return post ? (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => togglePinnedPost(id)}
                    >
                      {post.title}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
