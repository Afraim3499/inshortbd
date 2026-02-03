'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCollection(
  collectionId: string,
  data: {
    title?: string
    slug?: string
    description?: string
    featured_image_url?: string
  }
): Promise<{ success: boolean; error?: string }> {
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

    // Check permissions
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('created_by')
      .eq('id', collectionId)
      .single()

    if (!collection || collectionError) {
      return { success: false, error: 'Collection not found' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const typedCollection = collection as { created_by: string }
    const isOwner = typedCollection.created_by === user.id
    const isAuthorized =
      profile &&
      !profileError &&
      'role' in profile &&
      ['admin', 'editor'].includes((profile as { role: 'admin' | 'editor' | 'reader' }).role)

    if (!isOwner && !isAuthorized) {
      return { success: false, error: 'Not authorized' }
    }

    // Update collection
    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.slug) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.featured_image_url !== undefined)
      updateData.featured_image_url = data.featured_image_url

    const { error } = await supabase
      .from('collections')
      .update(updateData)
      .eq('id', collectionId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/collections')
    revalidatePath('/collections')

    return { success: true }
  } catch (error) {
    console.error('Error updating collection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}





