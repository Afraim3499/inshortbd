'use client'

import { useMemo } from 'react'
import { analyzeHeadings, extractHeadings } from '@/lib/seo/headings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heading, CheckCircle2, AlertCircle } from 'lucide-react'

interface HeadingStructureProps {
  content: string
}

export function HeadingStructure({ content }: HeadingStructureProps) {
  const analysis = useMemo(() => analyzeHeadings(content), [content])
  const headings = useMemo(() => extractHeadings(content), [content])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heading className="h-5 w-5" />
          Heading Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Headings</p>
            <p className="text-2xl font-bold">{analysis.headingCount}</p>
          </div>
          <Badge variant={analysis.hasH1 && analysis.h1Count === 1 ? 'default' : 'destructive'}>
            {analysis.hasH1 ? 'H1 Present' : 'No H1'}
          </Badge>
        </div>

        {analysis.issues.length > 0 && (
          <Alert variant={analysis.hasH1 ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {headings.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-sm font-semibold">Structure:</p>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {headings.map((heading, index) => {
                const indent = heading.level - 1
                const hasIssues = analysis.hierarchy[index]?.issues.length > 0

                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm"
                    style={{ paddingLeft: `${indent * 16}px` }}
                  >
                    {hasIssues ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs">
                        H{heading.level}
                      </Badge>
                      <span className="truncate">{heading.text}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {headings.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No headings found. Add headings to structure your content better.
          </p>
        )}
      </CardContent>
    </Card>
  )
}






