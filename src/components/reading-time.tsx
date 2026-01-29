import { calculateReadingTime } from '@/lib/reading-time'

interface ReadingTimeProps {
  content: any
  className?: string
}

export function ReadingTime({ content, className = '' }: ReadingTimeProps) {
  const minutes = calculateReadingTime(content)

  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      {minutes} {minutes === 1 ? 'min' : 'mins'} read
    </span>
  )
}






