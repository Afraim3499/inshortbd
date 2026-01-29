'use client'

import { useMemo } from 'react'
import { calculateReadability } from '@/lib/seo/readability'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, TrendingUp } from 'lucide-react'

interface ReadabilityIndicatorProps {
  content: string
}

export function ReadabilityIndicator({ content }: ReadabilityIndicatorProps) {
  const analysis = useMemo(() => calculateReadability(content), [content])

  const levelColor =
    analysis.score >= 70
      ? 'text-green-500'
      : analysis.score >= 50
        ? 'text-yellow-500'
        : 'text-red-500'

  const badgeVariant =
    analysis.score >= 70
      ? 'default'
      : analysis.score >= 50
        ? 'secondary'
        : 'destructive'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Readability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${levelColor}`}>{analysis.score}</span>
              <span className="text-muted-foreground">/ 100</span>
            </div>
            <Badge variant={badgeVariant} className="mt-1">
              {analysis.level}
            </Badge>
          </div>
        </div>

        <Progress value={analysis.score} className="h-2" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Avg. Sentence Length</p>
            <p className="font-medium">{analysis.avgSentenceLength} words</p>
          </div>
          <div>
            <p className="text-muted-foreground">Words per Sentence</p>
            <p className="font-medium">{analysis.avgWordsPerSentence}</p>
          </div>
        </div>

        {analysis.recommendations.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold mb-2">Recommendations:</p>
            <ul className="space-y-1">
              {analysis.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}






