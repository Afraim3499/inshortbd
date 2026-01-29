'use client'

import { useState, useEffect } from 'react'
import { useCollections } from '@/hooks/useCollections'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createCollection } from '@/app/actions/collections/create'
import { addPostToCollection } from '@/app/actions/collections/add-post'
import { removePostFromCollection } from '@/app/actions/collections/remove-post'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface CollectionPickerProps {
  postId: string | null
  initialCollections?: string[]
  onCollectionsChange?: (collectionIds: string[]) => void
}

export function CollectionPicker({
  postId,
  initialCollections = [],
  onCollectionsChange,
}: CollectionPickerProps) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>(initialCollections)
  const [orderIndexes, setOrderIndexes] = useState<Record<string, number>>({})
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: collections, isLoading } = useCollections()

  useEffect(() => {
    if (initialCollections) {
      setTimeout(() => setSelectedCollections(initialCollections), 0)
    }
  }, [initialCollections])

  const handleAddCollection = async (collectionId: string) => {
    if (!postId) return

    const orderIndex = orderIndexes[collectionId] || 0
    const result = await addPostToCollection(collectionId, postId, orderIndex)

    if (result.success) {
      const newSelections = [...selectedCollections, collectionId]
      setSelectedCollections(newSelections)
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      if (onCollectionsChange) {
        onCollectionsChange(newSelections)
      }
    }
  }

  const handleRemoveCollection = async (collectionId: string) => {
    if (!postId) return

    const result = await removePostFromCollection(collectionId, postId)

    if (result.success) {
      const newSelections = selectedCollections.filter((id) => id !== collectionId)
      setSelectedCollections(newSelections)
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] })
      if (onCollectionsChange) {
        onCollectionsChange(newSelections)
      }
    }
  }

  const handleCreateCollection = async (formData: FormData) => {
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string

    const result = await createCollection({
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      description: description || undefined,
    })

    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      setCreateDialogOpen(false)
      if (result.id && postId) {
        await handleAddCollection(result.id)
      }
    }
  }

  const selectedCollectionObjects = collections?.filter((c) =>
    selectedCollections.includes(c.id)
  ) || []

  const availableCollections = collections?.filter(
    (c) => !selectedCollections.includes(c.id)
  ) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Collections</Label>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <form action={handleCreateCollection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collection-title">Title *</Label>
                <Input
                  id="collection-title"
                  name="title"
                  required
                  className="bg-zinc-800 border-zinc-700 text-zinc-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-slug">Slug</Label>
                <Input
                  id="collection-slug"
                  name="slug"
                  placeholder="auto-generated"
                  className="bg-zinc-800 border-zinc-700 text-zinc-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-description">Description</Label>
                <Input
                  id="collection-description"
                  name="description"
                  className="bg-zinc-800 border-zinc-700 text-zinc-50"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Collections */}
      {selectedCollectionObjects.length > 0 && (
        <div className="space-y-2">
          {selectedCollectionObjects.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center justify-between p-2 rounded-md bg-zinc-800/50 border border-zinc-700"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-zinc-50">{collection.title}</div>
                <div className="text-xs text-zinc-400">{collection.slug}</div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Order"
                  value={orderIndexes[collection.id] || 0}
                  onChange={(e) =>
                    setOrderIndexes((prev) => ({
                      ...prev,
                      [collection.id]: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-20 h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-50"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCollection(collection.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Collection Dropdown */}
      {availableCollections.length > 0 && (
        <Select
          onValueChange={(value) => {
            if (value && value !== 'none') {
              handleAddCollection(value)
            }
          }}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-50">
            <SelectValue placeholder="Add to collection..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {availableCollections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!isLoading && collections && collections.length === 0 && (
        <p className="text-xs text-zinc-400">
          No collections yet. Create one to get started.
        </p>
      )}
    </div>
  )
}

