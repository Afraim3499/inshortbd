import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      className={cn('flex items-center gap-2 text-sm text-muted-foreground mb-6', className)}
      aria-label="Breadcrumb navigation"
      role="navigation"
    >
      <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
        {/* Home */}
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-accent transition-colors"
            itemProp="item"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only" itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {/* Other items */}
        {items.map((item, index) => (
          <li
            key={`${item.href}-${index}`}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium" itemProp="name">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-accent transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            )}
            <meta itemProp="position" content={(index + 2).toString()} />
          </li>
        ))}
      </ol>
    </nav>
  )
}

