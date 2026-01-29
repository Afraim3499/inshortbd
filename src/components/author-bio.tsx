'use client'

import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'
import Link from 'next/link'
import { NewsImage } from '@/components/news-image'
import { useEffect, useState } from 'react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthorBioProps {
  authorId: string | null
  customName?: string | null
}

export function AuthorBio({ authorId, customName }: AuthorBioProps) {
  const [author, setAuthor] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAuthor() {
      if (!authorId) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('id', authorId)
        .single()

      if (data) {
        setAuthor(data as Profile)
      }
      setLoading(false)
    }
    fetchAuthor()
  }, [authorId])

  if (loading) return null // Or skeleton
  if (!author && !customName) return null // Nothing to show if no data

  const typedAuthor = author
  const authorName = customName || typedAuthor?.full_name || typedAuthor?.email || 'Inshort Team'

  return (
    <div className="border-t border-border pt-8 mt-8">
      <div className="flex items-start gap-4">
        {typedAuthor?.avatar_url && (
          <Link href={`/author/${typedAuthor.id}`}>
            <div className="w-16 h-16 rounded-full overflow-hidden border border-border hover:border-accent transition-colors">
              <NewsImage
                src={typedAuthor.avatar_url}
                alt={authorName}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
          </Link>
        )}

        <div className="flex-1">
          <Link
            href={typedAuthor ? `/author/${typedAuthor.id}` : '#'}
            className={`font-heading font-bold text-lg hover:text-accent transition-colors ${!typedAuthor && 'pointer-events-none'}`}
          >
            {authorName}
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Author at Inshort
          </p>
        </div>
      </div>
    </div>
  )
}






