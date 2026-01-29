'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ImageIcon } from 'lucide-react'

interface NewsImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  sizes?: string // Added support for Next.js Image sizes
  path?: string | null | undefined // Legacy prop support
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function NewsImage({
  src: srcProp,
  alt,
  className,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  path, // Legacy prop
  fetchPriority
}: NewsImageProps) {
  const [hasError, setHasError] = useState(false)

  // Support both 'src' and 'path' props for backwards compatibility
  const src = srcProp || path

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'bg-zinc-900 flex items-center justify-center text-muted-foreground',
          fill && 'absolute inset-0',
          !fill && (width || height) && `w-[${width}px] h-[${height}px]`,
          className
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-8 h-8 opacity-50" />
      </div>
    )
  }

  // Resolve Supabase Storage URL
  // If src already contains the full URL, use it; otherwise construct it
  let imageUrl = src
  if (!src.startsWith('http')) {
    // Handle both cases: just filename or path
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src
    const imagePath = cleanSrc.startsWith('news-images/') ? cleanSrc : `news-images/${cleanSrc}`
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not configured')
      return (
        <div
          className={cn(
            'bg-zinc-900 flex items-center justify-center text-muted-foreground',
            fill && 'absolute inset-0',
            className
          )}
          role="img"
          aria-label={alt}
        >
          <ImageIcon className="w-8 h-8 opacity-50" />
        </div>
      )
    }
    imageUrl = `${supabaseUrl}/storage/v1/object/public/${imagePath}`
  }

  // Default sizes prop if not provided (Optimization)
  // 100vw mobile, 50vw tablet, 33vw desktop is a safe default for news cards
  const defaultSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={cn('object-cover', className)}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        fetchPriority={fetchPriority}
        decoding="async"
        sizes={sizes || defaultSizes}
        onError={() => setHasError(true)}
      // unoptimized={true} // REMOVED: Now leveraging Next.js Image Optimization
      />
    )
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width || 800}
      height={height || 400}
      className={cn('object-cover', className)}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      fetchPriority={fetchPriority}
      decoding="async"
      sizes={sizes || defaultSizes}
      onError={() => setHasError(true)}
    // unoptimized={true} // REMOVED: Now leveraging Next.js Image Optimization
    />
  )
}
