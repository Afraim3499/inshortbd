import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export type PresenceState = {
    user_id: string
    avatar_url?: string | null
    full_name?: string | null
    online_at: string
}

export function usePresence(postId: string, currentUser?: User) {
    const [viewers, setViewers] = useState<PresenceState[]>([])
    const supabase = createClient()

    useEffect(() => {
        if (!postId || !currentUser) return

        const channel = supabase.channel(`presence:${postId}`)

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState()
                const activeViewers: PresenceState[] = []

                for (const key in newState) {
                    const users = newState[key] as any[]
                    users.forEach(u => activeViewers.push(u))
                }

                // Filter out duplicates (if any) and current user if desired, 
                // but seeing yourself is sometimes good debug. 
                // We'll keep everyone.
                setViewers(activeViewers)
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
                console.log('User joined:', newPresences)
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
                console.log('User left:', leftPresences)
            })
            .subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    // Track my presence
                    await channel.track({
                        user_id: currentUser.id,
                        avatar_url: currentUser.user_metadata?.avatar_url,
                        full_name: currentUser.user_metadata?.full_name || currentUser.email,
                        online_at: new Date().toISOString(),
                    })
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [postId, currentUser?.id]) // Re-run if ID changes

    return { viewers }
}
