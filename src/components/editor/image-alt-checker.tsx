'use client'

import { useMemo } from 'react'
import { analyzeImages } from '@/lib/seo/images'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react'

interface ImageAltCheckerProps {
  content: string
}

export function ImageAltChecker({ content }: ImageAltCheckerProps) {
  const analysis = useMemo(() => analyzeImages(content), [content])

  if (analysis.totalImages === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No images found. Consider adding relevant images to improve engagement.
          </p>
        </CardContent>
      </Card>
    )
  }

  const allHaveAlt = analysis.imagesWithAlt === analysis.totalImages

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Image Alt Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Images</p>
            <p className="text-2xl font-bold">{analysis.totalImages}</p>
          </div>
          <Badge variant={allHaveAlt ? 'default' : 'destructive'}>
            {analysis.imagesWithAlt}/{analysis.totalImages} with alt text
          </Badge>
        </div>

        {analysis.imagesWithoutAlt > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-1">
                {analysis.imagesWithoutAlt} image(s) missing alt text
              </p>
              <p className="text-sm">
                Add descriptive alt text for better accessibility and SEO. Alt text should describe
                the image content.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {allHaveAlt && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>All images have alt text. Great job!</AlertDescription>
          </Alert>
        )}

        {analysis.recommendations.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-semibold mb-2">Recommendations:</p>
            <ul className="space-y-1">
              {analysis.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
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






