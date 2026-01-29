'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCollection(data: {
  title: string
  slug: string
  description?: string
  featured_image_url?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
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

    // Validate required fields
    if (!data.title || !data.slug) {
      return { success: false, error: 'Title and slug are required' }
    }

    // Insert collection
    // Note: collections table may not be in generated Database types
    const { data: collection, error } = await (supabase
      .from('collections') as any)
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        featured_image_url: data.featured_image_url || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error || !collection) {
      return { success: false, error: error?.message || 'Failed to create collection' }
    }

    revalidatePath('/admin/collections')
    revalidatePath('/collections')

    return { success: true, id: collection.id }
  } catch (error) {
    console.error('Error creating collection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





