'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleEditorsPick(postId: string, isPick: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('posts')
        .update({ is_editors_pick: isPick })
        .eq('id', postId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/admin/desk')
    revalidatePath('/') // Revalidate homepage where picks are shown
    return { success: true }
}
