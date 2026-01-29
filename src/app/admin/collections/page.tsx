'use client'

import { useState } from 'react'
import { useCollections } from '@/hooks/useCollections'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createCollection } from '@/app/actions/collections/create'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function CollectionsPage() {
  const { data: collections, isLoading } = useCollections()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (formData: FormData) => {
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
      if (result.id) {
        router.push(`/admin/collections/${result.id}`)
      }
    } else {
      alert(result.error || 'Failed to create collection')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Collections</h1>
          <p className="text-zinc-400 mt-1">
            Organize articles into collections and series
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  className="bg-zinc-800 border-zinc-700 text-zinc-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="auto-generated"
                  className="bg-zinc-800 border-zinc-700 text-zinc-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
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

      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Loading collections...</div>
      ) : !collections || collections.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>No collections yet. Create your first collection to get started.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Title</TableHead>
                <TableHead className="text-zinc-400">Slug</TableHead>
                <TableHead className="text-zinc-400">Posts</TableHead>
                <TableHead className="text-zinc-400">Created</TableHead>
                <TableHead className="text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.id} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-50">
                    {collection.title}
                  </TableCell>
                  <TableCell className="text-zinc-400 font-mono text-sm">
                    {collection.slug}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {(collection as any).posts_count || 0}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {new Date(collection.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/collections/${collection.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-zinc-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/collections/${collection.slug}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-zinc-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}






