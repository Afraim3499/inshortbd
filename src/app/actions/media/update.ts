'use server'

import { createClient } from '@/utils/supabase/server'

export async function updateMediaFile(
  id: string,
  updates: {
    alt_text?: string | null
    caption?: string | null
    credit?: string | null
    tags?: string[]
    category?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Note: media_files table may not be in generated Database types
    const { error } = await (supabase
      .from('media_files') as any)
      .update(updates)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating media file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function deleteMediaFile(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get file path before deleting
    // Note: media_files table may not be in generated Database types
    const { data: mediaFile } = await (supabase
      .from('media_files') as any)
      .select('file_path')
      .eq('id', id)
      .single()

    if (!mediaFile) {
      return { success: false, error: 'Media file not found' }
    }

    // Delete from database
    const { error: dbError } = await (supabase.from('media_files') as any).delete().eq('id', id)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('news-images')
      .remove([mediaFile.file_path])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      // Don't fail if storage delete fails - file might already be deleted
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting media file:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function bulkDeleteMediaFiles(
  ids: string[]
): Promise<{ success: boolean; error?: string; deletedCount?: number }> {
  try {
    const supabase = await createClient()

    let deletedCount = 0
    const errors: string[] = []

    for (const id of ids) {
      const result = await deleteMediaFile(id)
      if (result.success) {
        deletedCount++
      } else {
        errors.push(result.error || 'Unknown error')
      }
    }

    if (deletedCount === 0 && errors.length > 0) {
      return { success: false, error: errors.join(', ') }
    }

    return { success: true, deletedCount }
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





