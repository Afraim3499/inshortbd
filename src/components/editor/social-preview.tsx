'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NewsImage } from '@/components/news-image'
import { getSiteUrl } from '@/lib/env'
import { Facebook, Linkedin, Twitter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialPreviewProps {
  title: string
  excerpt: string | null
  featuredImageUrl: string | null
  slug: string
  siteUrl?: string
}

function CharacterCount({ current, max, className }: { current: number; max: number; className?: string }) {
  const isValid = current <= max
  return (
    <span className={cn('text-xs', isValid ? 'text-muted-foreground' : 'text-destructive', className)}>
      {current}/{max}
    </span>
  )
}

export function SocialPreview({
  title,
  excerpt,
  featuredImageUrl,
  slug,
  siteUrl,
}: SocialPreviewProps) {
  const siteUrlFinal = siteUrl || getSiteUrl()
  const articleUrl = `${siteUrlFinal}/news/${slug}`
  const metaDescription = excerpt || title

  // Character limits
  const titleLength = title.length
  const descriptionLength = metaDescription.length

  // Recommended dimensions
  const imageWidth = 1200
  const imageHeight = 630

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Twitter Card Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            {featuredImageUrl && (
              <div className="w-full aspect-[1200/630] relative bg-zinc-900">
                <NewsImage
                  src={featuredImageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{siteUrlFinal.replace(/^https?:\/\//, '')}</span>
              </div>
              <h3 className="font-semibold line-clamp-2">{title}</h3>
              {metaDescription && (
                <p className="text-sm text-muted-foreground line-clamp-2">{metaDescription}</p>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <CharacterCount current={titleLength} max={70} />
            <CharacterCount current={descriptionLength} max={200} />
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended image: {imageWidth}x{imageHeight}px
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            Facebook / LinkedIn Preview (OpenGraph)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            {featuredImageUrl && (
              <div className="w-full aspect-[1200/630] relative bg-zinc-900">
                <NewsImage
                  src={featuredImageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{siteUrlFinal.replace(/^https?:\/\//, '')}</span>
              </div>
              <h3 className="font-semibold line-clamp-2">{title}</h3>
              {metaDescription && (
                <p className="text-sm text-muted-foreground line-clamp-3">{metaDescription}</p>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <CharacterCount current={titleLength} max={60} />
            <CharacterCount current={descriptionLength} max={155} />
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended image: {imageWidth}x{imageHeight}px (1.91:1 ratio)
          </p>
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h4 className="text-sm font-semibold">Preview URL</h4>
        <p className="text-xs text-muted-foreground font-mono break-all">
          {articleUrl}
        </p>
      </div>
    </div>
  )
}






