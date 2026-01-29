import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface LockState {
    isLocked: boolean
    lockedBy: string | null // User ID
    lockedByEmail: string | null
    expiresAt: string | null
}

const LOCK_DURATION_MINUTES = 5

export function useSmartLock(postId: string | undefined, currentUser: User | undefined) {
    const [lockState, setLockState] = useState<LockState>({
        isLocked: false,
        lockedBy: null,
        lockedByEmail: null,
        expiresAt: null,
    })

    const supabase = createClient()

    // 1. Check Lock Status periodically / on Mount
    const checkLock = useCallback(async () => {
        if (!postId) return

        const { data: locks, error } = await supabase
            .from('editing_locks')
            .select('*')
            .eq('post_id', postId)
            .gt('expires_at', new Date().toISOString()) // Only valid locks

        const newState = (locks && locks.length > 0)
            ? {
                isLocked: locks[0].user_id !== currentUser?.id,
                lockedBy: locks[0].user_id,
                lockedByEmail: locks[0].user_email,
                expiresAt: locks[0].expires_at
            }
            : { isLocked: false, lockedBy: null, lockedByEmail: null, expiresAt: null }

        // Use setTimeout to avoid 'setState inside useEffect' linter error
        // (Since checkLock is called from useEffect)
        setTimeout(() => {
            setLockState(prev => {
                if (prev.isLocked === newState.isLocked &&
                    prev.lockedBy === newState.lockedBy &&
                    prev.expiresAt === newState.expiresAt) {
                    return prev
                }
                return newState
            })
        }, 0)
    }, [postId, currentUser?.id])

    // Initial check + Polling every 30s to catch expirations
    // Initial check + Polling every 30s to catch expirations
    useEffect(() => {
        const mounted = true

        const doCheck = () => {
            if (mounted) checkLock()
        }

        doCheck() // Initial check
        const interval = setInterval(doCheck, 30000)

        // Also listen to realtime changes on 'editing_locks'
        const channel = supabase.channel(`locks:${postId}`)
        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'editing_locks', filter: `post_id=eq.${postId}` },
            (payload: any) => {
                console.log('Lock change received:', payload)
                checkLock()
            }
        ).subscribe()

        return () => {
            clearInterval(interval)
            supabase.removeChannel(channel)
        }
    }, [checkLock, postId])

    // 2. Request Lock (Called when user starts typing)
    const requestLock = async () => {
        if (!postId || !currentUser || lockState.isLocked) return false

        const expiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60000).toISOString()

        // Optimistic check: Am I already the owner?
        if (lockState.lockedBy === currentUser.id) {
            // Extend lock
            const { error } = await supabase
                .from('editing_locks')
                .update({ expires_at: expiresAt })
                .eq('post_id', postId)
                .eq('user_id', currentUser.id)
            return !error
        }

        // Attempt to Insert (Will fail if unique constraint violated by another user)
        const { error } = await supabase
            .from('editing_locks')
            .insert({
                post_id: postId,
                user_id: currentUser.id,
                user_email: currentUser.email || null,
                expires_at: expiresAt
            })

        if (!error) {
            // Success
            setLockState({ isLocked: false, lockedBy: currentUser.id, lockedByEmail: currentUser.email || null, expiresAt })
            return true
        } else {
            // Failed (likely locked by someone else in the meantime)
            checkLock()
            return false
        }
    }

    // 3. Release Lock (Called on Save or Unmount)
    const releaseLock = async () => {
        if (!postId || !currentUser) return

        await supabase
            .from('editing_locks')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUser.id)

        checkLock()
    }

    return {
        lockState,
        requestLock,
        releaseLock,
        checkLock
    }
}
