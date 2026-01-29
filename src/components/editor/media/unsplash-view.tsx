'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, ImageIcon, Check, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { MediaFile } from '@/app/actions/media/list'

interface UnsplashViewProps {
    onSelect: (media: MediaFile) => void
    onClose: () => void
}

interface UnsplashPhoto {
    id: string
    urls: {
        regular: string
        small: string
        thumb: string
    }
    alt_description: string | null
    user: {
        name: string
        links: {
            html: string
        }
    }
}

export function UnsplashView({ onSelect, onClose }: UnsplashViewProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null)
    const [page, setPage] = useState(1)

    // Debounce search trigger (manual enter for now to save API calls)
    const handleSearch = () => {
        setDebouncedQuery(searchQuery)
        setPage(1)
        setSelectedPhoto(null)
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['unsplash', debouncedQuery, page],
        queryFn: async () => {
            if (!debouncedQuery) return { results: [] }
            const res = await fetch(`/api/unsplash?query=${encodeURIComponent(debouncedQuery)}&page=${page}`)
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to fetch')
            }
            return res.json()
        },
        enabled: !!debouncedQuery,
    })

    const photos: UnsplashPhoto[] = (data as any)?.results || []
    const hasPhotos = photos.length > 0

    const handleSelectConfirm = () => {
        if (!selectedPhoto) return

        // Transform to MediaFile structure
        const mediaFile: MediaFile = {
            id: `unsplash-${selectedPhoto.id}`,
            file_path: `unsplash/${selectedPhoto.id}`,
            file_name: `unsplash-${selectedPhoto.id}.jpg`,
            mime_type: 'image/jpeg',
            file_size: 0,
            width: null,
            height: null,
            alt_text: selectedPhoto.alt_description || `${selectedPhoto.user.name}-এর তোলা ছবি`,
            caption: `ছবি: ${selectedPhoto.user.name} (আনস্প্ল্যাশ-এর সৌজন্যে)`,
            credit: selectedPhoto.user.name,
            tags: [],
            category: 'unsplash',
            uploaded_at: new Date().toISOString(),
            url: selectedPhoto.urls.regular,
        }
        onSelect(mediaFile)
        onClose()
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b bg-card/50 space-y-2">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Unsplash (e.g. 'Business', 'Technology')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={isLoading || !searchQuery}>
                        Search
                    </Button>
                </div>
                {!debouncedQuery && (
                    <p className="text-xs text-muted-foreground">
                        Enter a search term to find high-quality free images.
                    </p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-destructive">
                        <p>{(error as Error).message || "An error occurred"}</p>
                        {(error as Error).message?.includes('configure') && (
                            <p className="text-sm text-muted-foreground mt-2">Add UNSPLASH_ACCESS_KEY to .env.local</p>
                        )}
                    </div>
                ) : !hasPhotos && debouncedQuery ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No photos found for &quot;{debouncedQuery}&quot;</p>
                    </div>
                ) : !debouncedQuery ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                        <ImageIcon className="h-16 w-16 mb-4 text-muted-foreground" />
                        <p>Search for something awesome</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4 pb-4">
                        {photos.map((photo) => {
                            const isSelected = selectedPhoto?.id === photo.id
                            return (
                                <div
                                    key={photo.id}
                                    className={cn(
                                        'group relative aspect-[3/2] rounded-lg overflow-hidden border-2 cursor-pointer transition-all bg-muted',
                                        isSelected
                                            ? 'border-accent ring-2 ring-accent'
                                            : 'border-transparent hover:border-accent/50',
                                    )}
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    <Image
                                        src={photo.urls.small}
                                        alt={photo.alt_description || 'Unsplash Image'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                    />
                                    {/* Credit Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                                        <span className="text-[10px] text-white truncate max-w-[80%]">ছবি: {photo.user.name}</span>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                                            <div className="bg-accent text-accent-foreground rounded-full p-2">
                                                <Check className="h-5 w-5" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                {/* Load More Trigger (Simplified) */}
                {hasPhotos && (
                    <div className="flex justify-center py-4">
                        <Button variant="ghost" onClick={() => setPage(p => p + 1)} disabled={isLoading}>
                            {isLoading ? 'লোড হচ্ছে...' : 'আরও দেখুন'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-card/50 flex items-center justify-between">
                <div className="text-sm text-muted-foreground max-w-[50%] truncate">
                    {selectedPhoto
                        ? (
                            <span className="flex items-center gap-1">
                                ছবি নির্বাচন করেছেন:
                                <a href={`${selectedPhoto.user.links.html}?utm_source=cms&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                                    {selectedPhoto.user.name}
                                </a>
                                on Unsplash
                            </span>
                        )
                        : 'Select a photo from Unsplash'
                    }
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSelectConfirm} disabled={!selectedPhoto}>Insert Image</Button>
                </div>
            </div>
        </div>
    )
}
