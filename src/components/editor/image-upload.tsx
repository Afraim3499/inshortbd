'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  className?: string
  disabled?: boolean
}

export function ImageUpload({ onUploadComplete, className, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const supabase = createClient()

  const uploadImage = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('news-images').getPublicUrl(filePath)

        onUploadComplete(publicUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image')
      } finally {
        setUploading(false)
      }
    },
    [supabase, onUploadComplete]
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
          uploadImage(file)
        }
      }
    },
    [uploadImage]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        uploadImage(e.target.files[0])
      }
    },
    [uploadImage]
  )

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        dragActive ? 'border-accent bg-accent/10' : 'border-border',
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="image-upload"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={uploading || disabled}
      />
      <label
        htmlFor="image-upload"
        className={cn(
          "cursor-pointer flex flex-col items-center gap-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">আপলোড হচ্ছে...</span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Drag & drop an image here or click to browse
            </span>
          </>
        )}
      </label>
    </div>
  )
}






