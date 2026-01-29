'use client'

import { useState } from 'react'
import { usePosts } from "@/hooks/usePosts"
import { columns } from "./_components/columns"
import { DataTable } from "./_components/data-table"
import { BulkActions } from "./_components/bulk-actions"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"
import { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

type StatusFilter = 'all' | 'draft' | 'review' | 'approved' | 'published' | 'archived'

export default function DeskPage() {
  const { data: posts, isLoading, error } = usePosts()
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredPosts = statusFilter === 'all' 
    ? posts 
    : posts?.filter((post: any) => post.status === statusFilter) || []

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading transmission...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">Transmission Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">The Desk</h1>
        <Link href="/admin/editor">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transmission
            </Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      
      {selectedPosts.length > 0 && (
        <BulkActions
          selectedPosts={selectedPosts}
          onClearSelection={() => setSelectedPosts([])}
        />
      )}
      
      <DataTable
        columns={columns}
        data={filteredPosts || []}
        onSelectionChange={setSelectedPosts}
      />
    </div>
  )
}
