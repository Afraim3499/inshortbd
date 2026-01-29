'use client'

import { formatDistanceToNow, format, isPast, isToday, differenceInDays } from 'date-fns'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useHasMounted } from '@/hooks/use-has-mounted'

interface DeadlineIndicatorProps {
  deadline: Date | string
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
  showIcon?: boolean
  className?: string
}

export function DeadlineIndicator({
  deadline,
  status = 'pending',
  showIcon = true,
  className,
}: DeadlineIndicatorProps) {
  const hasMounted = useHasMounted()

  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline

  // Safe default for server/hydration
  if (!hasMounted) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showIcon && <Clock className="h-4 w-4 text-zinc-400" />}
        <Badge variant="outline" className="text-xs">লোড হচ্ছে...</Badge>
      </div>
    )
  }

  const isOverdue = isPast(deadlineDate) && status !== 'completed'
  const daysRemaining = differenceInDays(deadlineDate, new Date())

  let variant: 'default' | 'destructive' | 'secondary' | 'outline' = 'outline'
  let label = ''
  let colorClass = ''

  if (status === 'completed') {
    variant = 'default'
    label = `Completed`
    colorClass = 'text-green-400'
  } else if (isOverdue) {
    variant = 'destructive'
    label = `${formatDistanceToNow(deadlineDate, { addSuffix: true })} মেয়াদ শেষ হয়েছে`
    colorClass = 'text-red-400'
  } else if (isToday(deadlineDate)) {
    variant = 'destructive'
    label = `Due today`
    colorClass = 'text-red-400'
  } else if (daysRemaining <= 3) {
    variant = 'destructive'
    label = `Due in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`
    colorClass = 'text-yellow-400'
  } else if (daysRemaining <= 7) {
    variant = 'secondary'
    label = `Due in ${daysRemaining} days`
    colorClass = 'text-yellow-400'
  } else {
    variant = 'outline'
    label = `Due ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`
    colorClass = 'text-zinc-400'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <>
          {status === 'completed' ? (
            <CheckCircle className={cn('h-4 w-4', colorClass)} />
          ) : isOverdue || daysRemaining <= 3 ? (
            <AlertTriangle className={cn('h-4 w-4', colorClass)} />
          ) : (
            <Clock className={cn('h-4 w-4', colorClass)} />
          )}
        </>
      )}
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
      <span className={cn('text-xs', colorClass)}>
        {format(deadlineDate, 'MMM d, yyyy')}
      </span>
    </div>
  )
}






