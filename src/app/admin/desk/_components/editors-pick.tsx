'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleEditorsPick } from '@/app/actions/posts/toggle-pick'
import { useToast } from '@/hooks/use-toast'

interface EditorsPickToggleProps {
    postId: string
    initialIsPick: boolean
}

export function EditorsPickToggle({ postId, initialIsPick }: EditorsPickToggleProps) {
    const [isPick, setIsPick] = useState(initialIsPick)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleToggle = async () => {
        setIsLoading(true)
        const newState = !isPick
        setIsPick(newState) // Optimistic update

        try {
            await toggleEditorsPick(postId, newState)
            toast({
                title: newState ? "Marked as Editor's Pick" : "Removed from Editor's Picks",
                description: "The homepage has been updated.",
            })
        } catch (error) {
            setIsPick(!newState) // Revert
            toast({
                title: "Error",
                description: "Failed to update pick status.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleToggle}
            disabled={isLoading}
            title={isPick ? "Remove from Editor's Picks" : "Add to Editor's Picks"}
        >
            <Star
                className={`h-4 w-4 transition-all ${isPick ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
                    }`}
            />
        </Button>
    )
}
