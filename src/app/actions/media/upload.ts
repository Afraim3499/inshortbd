'use server'

import { createClient } from '@/utils/supabase/server'

interface UploadMediaResult {
  success: boolean
  mediaId?: string
  url?: string
  error?: string
}

export async function uploadMediaFile(
  file: File,
  metadata: {
    altText?: string
    caption?: string
    credit?: string
    tags?: string[]
    category?: string
    width?: number
    height?: number
  }
): Promise<UploadMediaResult> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' }
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 10MB' }
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = fileName

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(filePath, file, {
        contentType: file.type,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('news-images').getPublicUrl(filePath)

    // Create database record
    // Note: media_files table may not be in generated Database types
    const { data: mediaFile, error: dbError } = await (supabase
      .from('media_files') as any)
      .insert({
        file_path: filePath,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        width: metadata.width || null,
        height: metadata.height || null,
        alt_text: metadata.altText || null,
        caption: metadata.caption || null,
        credit: metadata.credit || null,
        tags: metadata.tags || [],
        category: metadata.category || null,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      // If database insert fails, try to delete uploaded file
      await supabase.storage.from('news-images').remove([filePath])
      return { success: false, error: dbError.message }
    }

    return {
      success: true,
      mediaId: mediaFile.id,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Error uploading media:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

