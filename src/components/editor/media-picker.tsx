'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMediaFiles, type MediaFile } from '@/app/actions/media/list'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UnsplashView } from './media/unsplash-view'
import { Loader2, Search, Image as ImageIcon, Check } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaFile) => void
  requireAltText?: boolean
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  requireAltText = true,
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'unsplash'>('library')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Media Library</DialogTitle>
              <DialogDescription>
                Select or upload media for your content.
              </DialogDescription>
            </div>
          </div>
          <div className="flex gap-4 mt-4 border-b w-full">
            <button
              onClick={() => setActiveTab('library')}
              className={cn(
                "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'library'
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              My Library
            </button>
            <button
              onClick={() => setActiveTab('unsplash')}
              className={cn(
                "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'unsplash'
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Unsplash
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'library' && (
            <MediaLibraryView
              onSelect={(media) => {
                if (requireAltText && !media.alt_text) {
                  alert('This image requires alt text.')
                  return
                }
                onSelect(media)
                onClose()
              }}
              onClose={onClose}
              requireAltText={requireAltText}
            />
          )}
          {activeTab === 'unsplash' && (
            <UnsplashView onSelect={onSelect} onClose={onClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Extracted Library View
function MediaLibraryView({ onSelect, onClose, requireAltText }: { onSelect: (m: MediaFile) => void, onClose: () => void, requireAltText: boolean }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['media-picker', searchQuery, page],
    queryFn: () =>
      getMediaFiles({
        search: searchQuery || undefined,
        limit: 24,
        offset: page * 24,
      }),
  })

  const mediaFiles = data?.data || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / 24)

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b bg-card/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ফাইলের নাম বা ক্যাপশন দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(0)
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No media files found matching your search'
                : 'No media files yet. Upload images to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {mediaFiles.map((media) => {
              const isSelected = selectedMedia?.id === media.id
              const hasAltText = !!media.alt_text

              return (
                <div
                  key={media.id}
                  className={cn(
                    'group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                    isSelected
                      ? 'border-accent ring-2 ring-accent'
                      : 'border-border hover:border-accent/50',
                    requireAltText && !hasAltText && 'opacity-60'
                  )}
                  onClick={() => setSelectedMedia(media)}
                >
                  <Image
                    src={media.url}
                    alt={media.alt_text || media.file_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <div className="bg-accent text-accent-foreground rounded-full p-2">
                        <Check className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <p className="text-white text-xs text-center px-2 line-clamp-2">
                      {media.alt_text || media.file_name}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-card/50 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedMedia ? `Selected: ${selectedMedia.file_name}` : 'Select an image'}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => selectedMedia && onSelect(selectedMedia)} disabled={!selectedMedia}>Insert Media</Button>
        </div>
      </div>
    </div>
  )
}






