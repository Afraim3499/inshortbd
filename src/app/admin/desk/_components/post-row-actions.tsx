'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { copyToClipboard } from '@/lib/tracking/utm-builder'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

interface PostRowActionsProps {
    post: Post
}

export function PostRowActions({ post }: PostRowActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            // Manual Cascade Delete Strategy

            // 1. Delete Analytics
            const { error: analyticsError } = await supabase
                .from('analytics_events')
                .delete()
                .eq('post_id', post.id)

            if (analyticsError) console.error('Error deleting analytics:', analyticsError)

            // 2. Delete Comments
            const { error: commentsError } = await supabase
                .from('comments')
                .delete()
                .eq('post_id', post.id)

            if (commentsError) console.log('Error deleting comments:', commentsError)

            // 3. Delete Post
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id)

            if (error) throw error

            router.refresh()
            setShowDeleteDialog(false)
        } catch (error: any) {
            console.error('Failed to delete post:', error)
            alert(`Error deleting post: ${error.message}`)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => copyToClipboard(post.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/editor?id=${post.id}`}>Edit Post</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post
                            &quot;{post.title}&quot; and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
