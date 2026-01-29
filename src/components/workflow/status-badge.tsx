'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type WorkflowStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived'

interface StatusBadgeProps {
  status: WorkflowStatus
  className?: string
}

const statusConfig: Record<
  WorkflowStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  review: { label: 'In Review', variant: 'default' },
  approved: { label: 'Approved', variant: 'outline' },
  published: { label: 'Published', variant: 'default' },
  archived: { label: 'Archived', variant: 'secondary' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  )
}






