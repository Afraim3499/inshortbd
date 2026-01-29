'use client'

import { useState } from 'react'
import { usePosts } from "@/hooks/usePosts"
import { columns } from "../desk/_components/columns"
import { DataTable } from "../desk/_components/data-table"
import { BulkActions } from "../desk/_components/bulk-actions"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

export default function FinanceAdminPage() {
    const { data: posts, isLoading, error } = usePosts()
    const [selectedPosts, setSelectedPosts] = useState<Post[]>([])

    const financePosts = posts?.filter((post: any) =>
        post.category?.toLowerCase() === 'finance'
    ) || []

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Finance Desk...</div>
    }

    if (error) {
        return <div className="p-8 text-center text-destructive">Transmission Error: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold">Finance Desk</h1>
                    <p className="text-muted-foreground mt-1">Managing articles in the Finance category.</p>
                </div>
                <Link href="/admin/editor?category=Finance">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Finance Post
                    </Button>
                </Link>
            </div>

            {selectedPosts.length > 0 && (
                <BulkActions
                    selectedPosts={selectedPosts}
                    onClearSelection={() => setSelectedPosts([])}
                />
            )}

            <DataTable
                columns={columns}
                data={financePosts}
                onSelectionChange={setSelectedPosts}
            />
        </div>
    )
}
