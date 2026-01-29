'use client'

import { useState, useCallback } from 'react'
import { uploadMediaFile } from '@/app/actions/media/upload'
import { resizeImage, validateImageFile, getImageDimensions } from '@/lib/media/optimizer'
import { Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ImageUploadWithLibraryProps {
  onUploadComplete: () => void
}

export function ImageUploadWithLibrary({ onUploadComplete }: ImageUploadWithLibraryProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    altText: '',
    caption: '',
    credit: '',
    tags: '',
    category: '',
  })

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setUploading(true)

      try {
        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
          setError(validation.error || 'Invalid file')
          setUploading(false)
          return
        }

        // Get dimensions
        let width: number | undefined
        let height: number | undefined
        try {
          const dimensions = await getImageDimensions(file)
          width = dimensions.width
          height = dimensions.height
        } catch (err) {
          console.error('Error getting dimensions:', err)
        }

        // Resize if needed (images larger than 1920px)
        let fileToUpload = file
        if (width && width > 1920) {
          try {
            const optimized = await resizeImage(file)
            fileToUpload = optimized.file
          } catch (err) {
            console.error('Error resizing image:', err)
            // Continue with original file if resize fails
          }
        }

        // Parse tags (comma-separated)
        const tags = metadata.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)

        // Upload
        const result = await uploadMediaFile(fileToUpload, {
          altText: metadata.altText || undefined,
          caption: metadata.caption || undefined,
          credit: metadata.credit || undefined,
          tags: tags.length > 0 ? tags : undefined,
          category: metadata.category || undefined,
          width,
          height,
        })

        if (result.success) {
          // Reset form
          setMetadata({
            altText: '',
            caption: '',
            credit: '',
            tags: '',
            category: '',
          })
          onUploadComplete()
        } else {
          setError(result.error || 'Upload failed')
        }
      } catch (err) {
        console.error('Error uploading:', err)
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [metadata, onUploadComplete]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith('image/')) {
          handleFile(file)
        }
      }
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0])
      }
    },
    [handleFile]
  )

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive ? 'border-accent bg-accent/10' : 'border-border'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="media-upload"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
        />
        <label
          htmlFor="media-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Uploading and optimizing...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Drag & drop an image here or click to browse
              </span>
              <span className="text-xs text-muted-foreground">
                Max 10MB. Images will be optimized automatically.
              </span>
            </>
          )}
        </label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metadata Form */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="alt-text">Alt Text *</Label>
          <Input
            id="alt-text"
            placeholder="Describe the image for accessibility"
            value={metadata.altText}
            onChange={(e) => setMetadata({ ...metadata, altText: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">বিভাগ</Label>
          <Input
            id="category"
            placeholder="e.g., News, Features"
            value={metadata.category}
            onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            placeholder="Image caption"
            value={metadata.caption}
            onChange={(e) => setMetadata({ ...metadata, caption: e.target.value })}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="credit">Credit</Label>
          <Input
            id="credit"
            placeholder="Photo credit"
            value={metadata.credit}
            onChange={(e) => setMetadata({ ...metadata, credit: e.target.value })}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="tag1, tag2, tag3"
            value={metadata.tags}
            onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}






