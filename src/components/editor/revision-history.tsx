'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPostRevisions, type PostRevision } from '@/app/actions/revisions/get'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { RotateCcw, Clock, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RevisionHistoryProps {
    postId: string
    onRestore: (content: any, title: string, excerpt: string) => void
}

export function RevisionHistory({ postId, onRestore }: RevisionHistoryProps) {
    const [isOpen, setIsOpen] = useState(false)

    const { data: revisions = [], isLoading } = useQuery({
        queryKey: ['post-revisions', postId],
        queryFn: () => getPostRevisions(postId),
        enabled: isOpen,
    })

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden lg:flex" title="Version History">
                    <Clock className="h-4 w-4 mr-2" />
                    History
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Version History</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : revisions.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-8">
                            No revisions found. Check if the migration `20251211_create_post_revisions` has been run.
                        </p>
                    ) : (
                        <div className="relative border-l border-border ml-2 space-y-6 pb-4">
                            {revisions.map((rev) => (
                                <div key={rev.id} className="ml-6 relative group">
                                    <div className="absolute -left-[29px] mt-1.5 h-3 w-3 rounded-full border border-border bg-background group-hover:bg-primary transition-colors" />
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {rev.author?.full_name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to restore this version? Current changes will be overwritten.')) {
                                                    onRestore(rev.content, rev.title, rev.excerpt || '')
                                                    setIsOpen(false)
                                                }
                                            }}
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Restore
                                        </Button>
                                    </div>
                                    <div className="mt-2 p-3 bg-muted/30 rounded-md text-xs text-muted-foreground border border-border/50">
                                        <p className="font-semibold text-foreground mb-1">{rev.title}</p>
                                        {rev.excerpt && <p className="line-clamp-2">{rev.excerpt}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
