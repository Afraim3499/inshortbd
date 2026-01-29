'use server'

import { createClient } from '@/utils/supabase/server'

export interface MediaFile {
  id: string
  file_path: string
  file_name: string
  mime_type: string
  file_size: number
  width: number | null
  height: number | null
  alt_text: string | null
  caption: string | null
  credit: string | null
  tags: string[] | null
  category: string | null
  uploaded_at: string
  url: string
}

export async function getMediaFiles(
  options?: {
    search?: string
    category?: string
    tags?: string[]
    limit?: number
    offset?: number
  }
): Promise<{ data: MediaFile[]; count: number }> {
  try {
    const supabase = await createClient()

    // Note: media_files table may not be in generated Database types
    let query = (supabase
      .from('media_files') as any)
      .select('*', { count: 'exact' })
      .order('uploaded_at', { ascending: false })

    // Apply search filter
    if (options?.search) {
      query = query.or(
        `file_name.ilike.%${options.search}%,alt_text.ilike.%${options.search}%,caption.ilike.%${options.search}%`
      )
    }

    // Apply category filter
    if (options?.category) {
      query = query.eq('category', options.category)
    }

    // Apply tags filter
    if (options?.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags)
    }

    // Apply pagination
    const limit = options?.limit || 24
    const offset = options?.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching media files:', error)
      return { data: [], count: 0 }
    }

    // Get public URLs for all files
    const mediaFiles: MediaFile[] =
      data?.map((file: any) => {
        const {
          data: { publicUrl },
        } = supabase.storage.from('news-images').getPublicUrl(file.file_path)

        return {
          ...file,
          url: publicUrl,
        }
      }) || []

    return {
      data: mediaFiles,
      count: count || 0,
    }
  } catch (error) {
    console.error('Error in getMediaFiles:', error)
    return { data: [], count: 0 }
  }
}

export async function getMediaFileById(id: string): Promise<MediaFile | null> {
  try {
    const supabase = await createClient()

    // Note: media_files table may not be in generated Database types
    const { data, error } = await (supabase
      .from('media_files') as any)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('news-images').getPublicUrl(data.file_path)

    return {
      ...data,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Error fetching media file:', error)
    return null
  }
}





