'use client'

import { useState, useEffect } from 'react'
import { updateMediaFile } from '@/app/actions/media/update'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { MediaFile } from '@/app/actions/media/list'

interface MediaMetadataEditorProps {
  media: MediaFile
  onClose: () => void
  onUpdate: () => void
}

export function MediaMetadataEditor({
  media,
  onClose,
  onUpdate,
}: MediaMetadataEditorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    altText: media.alt_text || '',
    caption: media.caption || '',
    credit: media.credit || '',
    tags: (media.tags || []).join(', '),
    category: media.category || '',
  })

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      const tags = metadata.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const result = await updateMediaFile(media.id, {
        alt_text: metadata.altText || null,
        caption: metadata.caption || null,
        credit: metadata.credit || null,
        tags: tags.length > 0 ? tags : [],
        category: metadata.category || null,
      })

      if (result.success) {
        onUpdate()
      } else {
        setError(result.error || 'Failed to update metadata')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metadata')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Media Metadata</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative aspect-video rounded-lg overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.url}
              alt={media.alt_text || media.file_name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-alt-text">Alt Text *</Label>
              <Input
                id="edit-alt-text"
                value={metadata.altText}
                onChange={(e) => setMetadata({ ...metadata, altText: e.target.value })}
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">বিভাগ</Label>
              <Input
                id="edit-category"
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                placeholder="e.g., News, Features"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-caption">Caption</Label>
              <Textarea
                id="edit-caption"
                value={metadata.caption}
                onChange={(e) => setMetadata({ ...metadata, caption: e.target.value })}
                placeholder="Image caption"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-credit">Credit</Label>
              <Input
                id="edit-credit"
                value={metadata.credit}
                onChange={(e) => setMetadata({ ...metadata, credit: e.target.value })}
                placeholder="Photo credit"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={metadata.tags}
                onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>File: {media.file_name}</p>
            <p>Size: {(media.file_size / 1024 / 1024).toFixed(2)} MB</p>
            {media.width && media.height && (
              <p>
                Dimensions: {media.width} × {media.height}px
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}






