'use client'

import { useMemo } from 'react'
import { getKeywordSuggestions, analyzeKeyword } from '@/lib/seo/keywords'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb } from 'lucide-react'

interface KeywordSuggestionsProps {
  title: string
  content: string
  excerpt: string
}

export function KeywordSuggestions({ title, content, excerpt }: KeywordSuggestionsProps) {
  const suggestions = useMemo(() => getKeywordSuggestions(title, content, excerpt), [
    title,
    content,
    excerpt,
  ])

  // Analyze primary keyword from title
  const titleWords = title.split(/\s+/).filter((w) => w.length > 4)
  const primaryKeyword = titleWords[0] || title.split(/\s+/)[0] || ''
  const keywordAnalysis = useMemo(
    () => (primaryKeyword ? analyzeKeyword(primaryKeyword, title, content, excerpt) : null),
    [primaryKeyword, title, content, excerpt]
  )

  if (!primaryKeyword) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Keyword Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {keywordAnalysis && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Primary Keyword</p>
              <Badge variant="outline">{primaryKeyword}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Density</p>
                <p className="font-medium">{keywordAnalysis.density}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Occurrences</p>
                <p className="font-medium">{keywordAnalysis.count}</p>
              </div>
            </div>

            {keywordAnalysis.recommendations.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-semibold mb-2">Recommendations:</p>
                <ul className="space-y-1">
                  {keywordAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold mb-2">Suggested Keywords:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}






