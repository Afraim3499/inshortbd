'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Library } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'

type Collection = Database['public']['Tables']['collections']['Row']

interface CollectionNavProps {
  postId: string
}

export function CollectionNav({ postId }: CollectionNavProps) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCollection() {
      const supabase = createClient()

      // Find which collection this post belongs to
      const { data: item } = await (supabase
        .from('collection_posts') as any)
        .select('collection_id')
        .eq('post_id', postId)
        .maybeSingle()

      if (item) {
        const { data: col } = await (supabase
          .from('collections') as any)
          .select('*')
          .eq('id', item.collection_id)
          .single()

        if (col) {
          setCollection(col as Collection)
        }
      }
      setLoading(false)
    }
    fetchCollection()
  }, [postId])

  if (loading || !collection) {
    return null
  }

  return (
    <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
      <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3 uppercase tracking-wider">
        <Library className="w-4 h-4" />
        <span>In Collection</span>
      </div>

      <h3 className="text-xl font-serif font-bold text-foreground mb-2">
        {collection.title}
      </h3>

      {collection.description && (
        <p className="text-muted-foreground mb-4 font-sans text-sm line-clamp-2">
          {collection.description}
        </p>
      )}

      <Link
        href={`/collections/${collection.slug}`}
        className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        title="View full collection"
      >
        Continue Reading
        <ChevronRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  )
}
