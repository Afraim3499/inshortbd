'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

interface SEORecommendationsProps {
  recommendations: string[]
}

export function SEORecommendations({ recommendations }: SEORecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your content looks great! No major SEO improvements needed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Categorize recommendations
  const critical = recommendations.filter((r) =>
    r.toLowerCase().includes('required') || r.toLowerCase().includes('missing')
  )
  const important = recommendations.filter(
    (r) =>
      r.toLowerCase().includes('consider') ||
      r.toLowerCase().includes('aim') ||
      r.toLowerCase().includes('should')
  )
  const suggestions = recommendations.filter(
    (r) => !critical.includes(r) && !important.includes(r)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Recommendations ({recommendations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {critical.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-500 mb-2">Critical</h4>
            <ul className="space-y-1">
              {critical.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {important.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-500 mb-2">Important</h4>
            <ul className="space-y-1">
              {important.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Info className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Suggestions</h4>
            <ul className="space-y-1">
              {suggestions.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2 text-muted-foreground">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
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






