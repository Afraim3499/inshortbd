'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { sanitizeHtml } from '@/lib/sanitize'
import { NewsImage } from '@/components/news-image'
import { ReadingTime } from '@/components/reading-time'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  excerpt: string | null
  content: any
  featuredImageUrl: string | null
  category: string
  tags: string[] | null
  publishedAt?: string | null
  views?: number | null
}

function renderContent(content: any) {
  if (!content) return null

  const html = generateHTML(content, [
    StarterKit,
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full h-auto',
      },
    }),
    Link.configure({
      HTMLAttributes: {
        class: 'text-accent underline',
      },
    }),
    TextStyle,
    Color,
  ])

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = sanitizeHtml(html)

  return (
    <div
      className="prose prose-zinc max-w-none prose-headings:font-heading prose-a:text-accent"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}

export function PreviewModal({
  isOpen,
  onClose,
  title,
  excerpt,
  content,
  featuredImageUrl,
  category,
  tags,
  publishedAt,
  views,
}: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Article Preview</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-8 bg-background min-h-0">
          <article className="max-w-3xl mx-auto">
            <header className="mb-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-accent">
                <span className="uppercase">{category}</span>
                {publishedAt && (
                  <>
                    <span>•</span>
                    <span>{new Date(publishedAt).toLocaleDateString()}</span>
                  </>
                )}
                {views !== null && views !== undefined && (
                  <>
                    <span>•</span>
                    <span>{views} views</span>
                  </>
                )}
                <span>•</span>
                <ReadingTime content={content} />
              </div>

              <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
                {title}
              </h1>

              {excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed">{excerpt}</p>
              )}

              {tags && Array.isArray(tags) && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {featuredImageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden border border-border/50 relative mt-6">
                  <NewsImage
                    src={featuredImageUrl}
                    alt={title}
                    fill
                    priority
                  />
                </div>
              )}
            </header>

            <div className="border-t border-border pt-8">
              {renderContent(content)}
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  )
}

