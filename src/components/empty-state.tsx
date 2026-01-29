import { cn } from '@/lib/utils'
import { Search, Newspaper, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'

interface EmptyStateProps {
  type?: 'search' | 'articles' | 'tag' | 'author' | 'generic'
  title?: string
  description?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({
  type = 'generic',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const icons = {
    search: Search,
    articles: Newspaper,
    tag: Tag,
    author: User,
    generic: Newspaper,
  }

  const defaultTitles = {
    search: 'No articles found',
    articles: 'No articles available',
    tag: 'No articles with this tag',
    author: 'No articles published yet',
    generic: 'Nothing here yet',
  }

  const defaultDescriptions = {
    search: 'Try adjusting your search terms or filters to find what you\'re looking for.',
    articles: 'Check back soon for new content.',
    tag: 'This tag doesn\'t have any published articles yet.',
    author: 'This author hasn\'t published any articles yet.',
    generic: 'Content will appear here soon.',
  }

  const Icon = icons[type]
  const finalTitle = title || defaultTitles[type]
  const finalDescription = description || defaultDescriptions[type]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-accent" />
      </div>
      <h3 className="text-xl font-heading font-bold mb-2">{finalTitle}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{finalDescription}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}

