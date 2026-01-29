
'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTeamMembers() {
    const supabase = await createClient()

    // Use public client to fetch profiles (RLS allows reading public profile info)
    // or use admin client if we need email (which is private in auth.users, but profiles table usually has it)
    // Let's use standard client first, assuming profiles table is viewable by authenticated users
    // If we need strict RLS bypass, we use admin client.

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'editor'])
        .order('full_name', { ascending: true })

    if (error) {
        console.error('Error fetching team members:', error)
        return []
    }

    return profiles || []
}

export async function createTeamMember(prevState: any, formData: FormData) {
    const startTime = Date.now()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as 'admin' | 'editor'

    if (!email || !password || !fullName || !role) {
        return { success: false, error: 'All fields are required' }
    }

    const supabaseAdmin = createAdminClient()

    try {
        // 1. Create User in Auth
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
        })

        if (createError) {
            // Handle "User already registered" gracefullly if needed, or just throw
            return { success: false, error: createError.message }
        }

        const userId = userData.user.id

        // 2. Update Profile Role
        // Profiles are usually created via Triggers on auth.users insert. 
        // We update the row to set the role specificly.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email,
                full_name: fullName,
                role: role
            })

        if (profileError) {
            console.error('Error updating profile role:', profileError)
            return { success: false, error: `User created but failed to set role: ${profileError.message} (${profileError.details || profileError.code})` }
        }

        revalidatePath('/admin/team')
        return { success: true, message: `Team member ${fullName} created successfully` }

    } catch (err: any) {
        console.error('Create team member error:', err)
        return { success: false, error: err.message || 'Failed to create team member' }
    }
}
