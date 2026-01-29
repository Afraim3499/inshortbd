'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMediaFiles, type MediaFile } from '@/app/actions/media/list'
import { deleteMediaFile, bulkDeleteMediaFiles } from '@/app/actions/media/update'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ImageUploadWithLibrary } from '@/components/media/image-upload-with-library'
import { MediaMetadataEditor } from '@/components/media/media-metadata-editor'
import {
  Search,
  Upload,
  Trash2,
  Edit2,
  Image as ImageIcon,
  X,
  Loader2,
  CheckSquare,
  Square,
  Link as LinkIcon,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/tracking/utm-builder'

export default function MediaLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set())
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null)
  const [deletingMedia, setDeletingMedia] = useState<MediaFile | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [page, setPage] = useState(0)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['media-files', searchQuery, filterCategory, page],
    queryFn: () =>
      getMediaFiles({
        search: searchQuery || undefined,
        category: filterCategory || undefined,
        limit: 24,
        offset: page * 24,
      }),
  })

  const mediaFiles = data?.data || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / 24)

  const handleDelete = useCallback(async (media: MediaFile) => {
    const result = await deleteMediaFile(media.id)
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['media-files'] })
      setDeletingMedia(null)
    } else {
      alert(result.error || 'Failed to delete media')
    }
  }, [queryClient])

  const handleBulkDelete = useCallback(async () => {
    if (selectedMedia.size === 0) return

    const confirm = window.confirm(
      `Are you sure you want to delete ${selectedMedia.size} media file(s)?`
    )
    if (!confirm) return

    const result = await bulkDeleteMediaFiles(Array.from(selectedMedia))
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['media-files'] })
      setSelectedMedia(new Set())
    } else {
      alert(result.error || 'Failed to delete media')
    }
  }, [selectedMedia, queryClient])

  const toggleSelection = useCallback((id: string) => {
    setSelectedMedia((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedMedia.size === mediaFiles.length) {
      setSelectedMedia(new Set())
    } else {
      setSelectedMedia(new Set(mediaFiles.map((m) => m.id)))
    }
  }, [selectedMedia, mediaFiles])

  // Get unique categories
  const categories = Array.from(
    new Set(
      mediaFiles
        .map((m) => m.category)
        .filter((c): c is string => c !== null && c !== '')
    )
  )

  // Drag and Drop Handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // If files are dropped, open the upload dialog
    // Ideally, we'd pass the files to the dialog, but for now just opening it is a good step
    // Enhancing ImageUploadWithLibrary to accept initial files would be the next step
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setShowUpload(true)
    }
  }, [])

  return (
    <div
      className="space-y-6 relative min-h-[500px]"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Global Drop Overlay */}
      {dragActive && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm border-2 border-dashed border-accent flex flex-col items-center justify-center rounded-lg animate-in fade-in-0 zoom-in-95 pointer-events-none">
          <Upload className="h-16 w-16 text-accent mb-4" />
          <h3 className="text-2xl font-bold">Drop files to upload</h3>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your images and media files. Drag & drop anywhere to upload.
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Media
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename, alt text, or caption..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(0)
            }}
            className="pl-10"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value)
              setPage(0)
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedMedia.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <span className="text-sm font-medium">
            {selectedMedia.size} file(s) selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : mediaFiles.length === 0 ? (
        <Card
          className="cursor-pointer hover:border-accent transition-colors border-dashed"
          onClick={() => setShowUpload(true)}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterCategory
                ? 'No media files found matching your criteria'
                : 'No media files yet. Drag & drop images here or click to upload!'}
            </p>
            {!searchQuery && !filterCategory && (
              <Button variant="outline">Upload Media</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Select All Button */}
            <Card
              className={cn(
                'cursor-pointer hover:border-accent transition-colors',
                selectedMedia.size === mediaFiles.length && 'border-accent'
              )}
              onClick={toggleSelectAll}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 aspect-square">
                {selectedMedia.size === mediaFiles.length ? (
                  <CheckSquare className="h-8 w-8 mb-2 text-accent" />
                ) : (
                  <Square className="h-8 w-8 mb-2 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground text-center">
                  Select All
                </span>
              </CardContent>
            </Card>

            {/* Media Items */}
            {mediaFiles.map((media) => (
              <Card
                key={media.id}
                className={cn(
                  'group relative overflow-hidden cursor-pointer hover:border-accent transition-colors',
                  selectedMedia.has(media.id) && 'border-accent ring-2 ring-accent'
                )}
              >
                <div
                  className="relative aspect-square"
                  onClick={() => toggleSelection(media.id)}
                >
                  <Image
                    src={media.url}
                    alt={media.alt_text || media.file_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(media.url).then(() => {
                            alert('URL copied to clipboard!')
                          })
                        }}
                        title="Copy URL"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingMedia(media)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingMedia(media)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedMedia.has(media.id) && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-accent text-accent-foreground rounded-full p-1">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground truncate" title={media.file_name}>
                    {media.file_name}
                  </p>
                  {media.alt_text && (
                    <p className="text-xs text-muted-foreground/70 truncate" title={media.alt_text}>
                      {media.alt_text}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )
      }

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Upload images to your media library. Images will be optimized automatically.
            </DialogDescription>
          </DialogHeader>
          <ImageUploadWithLibrary
            onUploadComplete={() => {
              setShowUpload(false)
              queryClient.invalidateQueries({ queryKey: ['media-files'] })
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Dialog */}
      {
        editingMedia && (
          <MediaMetadataEditor
            media={editingMedia}
            onClose={() => setEditingMedia(null)}
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['media-files'] })
              setEditingMedia(null)
            }}
          />
        )
      }

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingMedia}
        onOpenChange={(open) => !open && setDeletingMedia(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media File?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingMedia?.file_name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMedia && handleDelete(deletingMedia)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}






