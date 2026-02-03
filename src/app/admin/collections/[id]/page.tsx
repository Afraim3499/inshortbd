'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Search } from 'lucide-react'
import Link from 'next/link'
import { updateCollection } from '@/app/actions/collections/update'
import { addPostToCollection } from '@/app/actions/collections/add-post'
import { removePostFromCollection } from '@/app/actions/collections/remove-post'
import { reorderCollectionPosts } from '@/app/actions/collections/reorder-posts'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { ImageUpload } from '@/components/editor/image-upload'
import { NewsImage } from '@/components/news-image'

interface PageProps {
    params: Promise<{ id: string }>
}

function CollectionForm({ collection, initialPosts, id }: { collection: any, initialPosts: any[], id: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [addPostOpen, setAddPostOpen] = useState(false)
    const [posts, setPosts] = useState<any[]>(initialPosts || [])
    const [formData, setFormData] = useState({
        title: collection?.title || '',
        slug: collection?.slug || '',
        description: collection?.description || '',
        featured_image_url: collection?.featured_image_url || ''
    })

    // ... (keep search query)
    const { data: searchResults } = useQuery({
        queryKey: ['search-posts', searchTerm],
        queryFn: async () => {
            if (!searchTerm) return []

            const { data, error } = await supabase
                .from('posts')
                .select('id, title, status, published_at')
                .ilike('title', `%${searchTerm}%`)
                .neq('status', 'archived') // Optional: Exclude archived
                .limit(10)

            if (error) throw error
            return data
        },
        enabled: searchTerm.length > 2
    })

    // Update form data if collection prop updates (e.g. background revalidation)
    // NOTE: This IS a sync effect, but it's simpler than key-reset for the FORM itself if we want to allow external updates.
    // However, sticking to "Initial State" pattern prevents the lint error.
    // Since we mount this component only when data is ready, we rely on initial state.
    // If the user wants to see updates, they refresh.

    // Mutations
    const updateMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return await updateCollection(id, {
                title: data.title,
                slug: data.slug,
                description: data.description,
                featured_image_url: data.featured_image_url
            })
        },
        onSuccess: (result) => {
            if (result.success) {
                toast({ title: 'Collection updated' })
                queryClient.invalidateQueries({ queryKey: ['collection', id] })
            } else {
                toast({ title: 'Failed to update', description: result.error, variant: 'destructive' })
            }
        }
    })

    const addPostMutation = useMutation({
        mutationFn: async (postId: string) => {
            const currentCount = posts?.length || 0
            return await addPostToCollection(id, postId, currentCount)
        },
        onSuccess: (result) => {
            if (result.success) {
                toast({ title: 'Post added to collection' })
                setAddPostOpen(false)
                // We invalidate queries to get fresh data
                queryClient.invalidateQueries({ queryKey: ['collection-posts', id] })
                // AND we simply let the parent re-render?
                // Wait, if parent re-renders, does this component re-mount?
                // No, unless key changes.
                // So we need to update LOCAL state manually or usage useEffect to sync from props.
                // BUT usage useEffect causes the lint error.
                // Solution: We force re-mount by key in Parent, OR we update local state manually here.
                // Manual update is better for UX (fast).
                // But we need the post details.
                // Let's rely on Query Invalidation -> Parent Refetch -> Parent passes new Props.
                // Does Child update? No, Child State is isolated.
                // FIX: Use `useEffect` ONLY for `posts` synchronization if `initialPosts` changes?
                // The warning "Calling setState synchronously..." happens if we do it blindly.
                // If we check `if (initialPosts !== posts)`? Reference equality fails.
                // We can use a ref or deep comparison.
                // OR, just accept that "Add Post" requires a page refresh or manual fetch?
                // Better: `onSuccess` here fetches the new list?
                // Actually, `queryClient.invalidateQueries` triggers Parent re-render.
                // Parent passes new `initialPosts`.
                // Child receives new `initialPosts`.
                // Child needs to update `posts`.
                // `useEffect(() => setPosts(initialPosts), [initialPosts])`.
                // This is the "Sync" pattern.
                // Is it disallowed? "Stop using useEffect to sync state... when it can be done during initial render."
                // But this is an UPDATE.
                // The lint error "set-state-in-effect" specifically dislikes it when it causes LOOPS.
                // If `initialPosts` is stable (from React Query), it works.
                // I will add the sync effect but with a version check or just standard sync.
                // It should not error if `initialPosts` reference is stable.
            } else {
                toast({ title: 'Failed to add post', description: result.error, variant: 'destructive' })
            }
        }
    })

    // NOTE: Parent uses key={collection?.id + '-' + collectionPosts?.length} to force remount when data changes.
    // This eliminates the need for useEffect state sync. If posts need to update, parent re-mounts this component.

    const removePostMutation = useMutation({
        mutationFn: async (postId: string) => {
            return await removePostFromCollection(id, postId)
        },
        onSuccess: (result) => {
            if (result.success) {
                toast({ title: 'Post removed from collection' })
                queryClient.invalidateQueries({ queryKey: ['collection-posts', id] })
            } else {
                toast({ title: 'Failed to remove post', description: result.error, variant: 'destructive' })
            }
        }
    })

    const reorderMutation = useMutation({
        mutationFn: async (newOrder: any[]) => {
            // Prepare payload: array of { post_id, new_index }
            const reorderItems = newOrder.map((item, index) => ({
                post_id: item.post_id,
                new_index: index
            }))
            return await reorderCollectionPosts(id, reorderItems)
        },
        onSuccess: (result) => {
            if (result.success) {
                toast({ title: 'Order saved' })
                queryClient.invalidateQueries({ queryKey: ['collection-posts', id] })
            } else {
                toast({ title: 'Failed to save order', description: result.error, variant: 'destructive' })
            }
        }
    })

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const sourceIndex = result.source.index
        const destinationIndex = result.destination.index

        if (sourceIndex === destinationIndex) return

        const newPosts = Array.from(posts)
        const [reorderedItem] = newPosts.splice(sourceIndex, 1)
        newPosts.splice(destinationIndex, 0, reorderedItem)

        setPosts(newPosts) // Optimistic update
        reorderMutation.mutate(newPosts)
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/collections">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-bold">{formData.title}</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-mono">{formData.slug}</p>
                    </div>
                </div>
                <Link href={`/collections/${collection?.slug || ''}`} target="_blank">
                    <Button variant="outline" size="sm">
                        View Public Page
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Post List (Sortable) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Collection Items</h2>
                        <Dialog open={addPostOpen} onOpenChange={setAddPostOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Article
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-50">
                                <DialogHeader>
                                    <DialogTitle>Add Article to Collection</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search articles..."
                                            className="pl-9 bg-zinc-800 border-zinc-700"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                        {searchTerm.length < 3 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">Type at least 3 characters to search</p>
                                        )}
                                        {searchResults?.map((post: any) => {
                                            const isAlreadyIn = posts?.some((cp: any) => cp.post_id === post.id)
                                            return (
                                                <div key={post.id} className="flex items-center justify-between p-3 rounded-md border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
                                                    <div className="flex-1 min-w-0 mr-4">
                                                        <p className="font-medium text-sm truncate">{post.title}</p>
                                                        <span className={cn(
                                                            "text-xs px-1.5 py-0.5 rounded-full",
                                                            post.status === 'published' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                                        )}>{post.status}</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        disabled={isAlreadyIn || addPostMutation.isPending}
                                                        onClick={() => addPostMutation.mutate(post.id)}
                                                        variant={isAlreadyIn ? "ghost" : "default"}
                                                    >
                                                        {isAlreadyIn ? "Added" : "Add"}
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                        {searchTerm.length >= 3 && searchResults?.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center">No articles found</p>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                        {!posts || posts.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <p>No articles in this collection yet. Add some to get started.</p>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="collection-posts">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="divide-y divide-border"
                                        >
                                            {posts.map((item: any, index: number) => (
                                                <Draggable key={item.post_id} draggableId={item.post_id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={cn(
                                                                "flex items-center gap-4 p-4 bg-card transition-colors",
                                                                snapshot.isDragging && "bg-accent/10 shadow-lg z-10"
                                                            )}
                                                        >
                                                            <div {...provided.dragHandleProps} className="cursor-move text-muted-foreground hover:text-foreground">
                                                                <GripVertical className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-mono text-muted-foreground">
                                                                        #{index + 1}
                                                                    </span>
                                                                    <span className={cn(
                                                                        "text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                                                                        item.post?.status === 'published' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                                                    )}>
                                                                        {item.post?.status || 'Unknown'}
                                                                    </span>
                                                                </div>
                                                                <p className="font-medium truncate">{item.post?.title || <span className="text-destructive">Deleted Article</span>}</p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={removePostMutation.isPending}
                                                                onClick={() => removePostMutation.mutate(item.post_id)}
                                                                className="text-muted-foreground hover:text-destructive shrink-0"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                </div>

                {/* Sidebar: Details Form */}
                <div className="space-y-6">
                    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                        <h3 className="font-bold text-lg">Collection Details</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            updateMutation.mutate(formData)
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cover Image</Label>
                                {formData.featured_image_url ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border group">
                                        <NewsImage
                                            src={formData.featured_image_url}
                                            alt="Cover"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev) => ({ ...prev, featured_image_url: '' }))
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove Image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <ImageUpload
                                        onUploadComplete={(url: string) =>
                                            setFormData((prev) => ({ ...prev, featured_image_url: url }))
                                        }
                                    />
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Recommended size: 1920x1080px (16:9)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CollectionEditorPage({ params }: PageProps) {
    const { id } = use(params)
    const supabase = createClient()

    // Fetch Collection Details
    const { data: collection, isLoading: isLoadingCollection } = useQuery({
        queryKey: ['collection', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data
        }
    })

    // Fetch Collection Posts
    const { data: collectionPosts, isLoading: isLoadingPosts } = useQuery({
        queryKey: ['collection-posts', id],
        queryFn: async () => {
            // Join with posts table to get titles
            const { data, error } = await supabase
                .from('collection_posts')
                .select(`
          *,
          post:posts (
            id,
            title,
            status,
            published_at,
            featured_image_url
          )
        `)
                .eq('collection_id', id)
                .order('order_index', { ascending: true })

            if (error) throw error
            return data
        },
    })

    if (isLoadingCollection || isLoadingPosts) {
        return <div className="p-8 text-center text-muted-foreground">Loading collection...</div>
    }

    if (!collection) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Collection not found</h2>
                <Link href="/admin/collections">
                    <Button>Go Back</Button>
                </Link>
            </div>
        )
    }

    return <CollectionForm key={`${collection?.id}-${collectionPosts?.length}`} collection={collection} initialPosts={collectionPosts || []} id={id} />
}
