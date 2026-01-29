'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SEOScoreProps {
  score: number
  previousScore?: number
}

export function SEOScore({ score, previousScore }: SEOScoreProps) {
  const scoreColor =
    score >= 80
      ? 'text-green-500'
      : score >= 60
        ? 'text-yellow-500'
        : 'text-red-500'

  const bgColor =
    score >= 80
      ? 'bg-green-500/10 border-green-500/20'
      : score >= 60
        ? 'bg-yellow-500/10 border-yellow-500/20'
        : 'bg-red-500/10 border-red-500/20'

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 40) return 'Poor'
    return 'Very Poor'
  }

  const scoreDifference = previousScore !== undefined ? score - previousScore : null

  return (
    <Card className={bgColor}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">SEO Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-muted-foreground">/ 100</span>
            </div>
          </div>
          <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
            {getScoreLabel(score)}
          </Badge>
        </div>

        <Progress value={score} className="h-3 mb-3" />

        {scoreDifference !== null && (
          <div className="flex items-center gap-2 text-sm">
            {scoreDifference > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+{scoreDifference} points</span>
              </>
            ) : scoreDifference < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-red-500">{scoreDifference} points</span>
              </>
            ) : (
              <>
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">No change</span>
              </>
            )}
            <span className="text-muted-foreground">from previous analysis</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}






