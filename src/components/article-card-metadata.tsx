import Link from 'next/link'
import { ReadingTime } from './reading-time'
import { createClient } from '@/utils/supabase/server'

async function getAuthorName(authorId: string | null) {
  if (!authorId) return null
  const supabase = await createClient()
  const { data } = await (supabase
    .from('profiles') as any)
    .select('full_name, email')
    .eq('id', authorId)
    .single()

  const typedData = data as { full_name: string | null; email: string | null } | null
  return typedData?.full_name || typedData?.email || null
}

interface ArticleCardMetadataProps {
  authorId: string | null
  publishedAt: string | null
  views: number | null
  content: any
  category: string
  showAuthor?: boolean
  showViews?: boolean
  showReadingTime?: boolean
}

export async function ArticleCardMetadata({
  authorId,
  publishedAt,
  views,
  content,
  category,
  showAuthor = true,
  showViews = true,
  showReadingTime = true,
}: ArticleCardMetadataProps) {
  const authorName = showAuthor ? await getAuthorName(authorId) : null

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground flex-wrap">
      <span className="text-accent uppercase">{category}</span>

      {publishedAt && (
        <>
          <span>•</span>
          <time dateTime={publishedAt}>
            <span suppressHydrationWarning>{new Date(publishedAt).toLocaleDateString('bn-BD')}</span>
          </time>
        </>
      )}

      {/* {showViews && views !== null && (
        <>
          <span>•</span>
          <span>{views.toLocaleString('bn-BD')} বার পঠিত</span>
        </>
      )} */}

      {showReadingTime && (
        <>
          <span>•</span>
          <ReadingTime content={content} />
        </>
      )}

      {showAuthor && authorName && authorId && (
        <>
          <span>•</span>
          <Link
            href={`/author/${authorId}`}
            className="hover:text-accent transition-colors"
          >
            {authorName}
          </Link>
        </>
      )}
    </div>
  )
}

