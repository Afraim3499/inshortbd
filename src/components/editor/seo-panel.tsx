'use client'

import { useEffect, useState } from 'react'
import { calculateSEOScore, type SEOAnalysis } from '@/lib/seo/analyzer'
import { analyzeHeadings, extractHeadings } from '@/lib/seo/headings'
import { analyzeImages } from '@/lib/seo/images'
import { analyzeLinks } from '@/lib/seo/links'
import { analyzeContentLength } from '@/lib/seo/length'
import { calculateReadability } from '@/lib/seo/readability'
import { analyzeMetaTags } from '@/lib/seo/meta'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { SEOScore } from './seo-score'
import { SEORecommendations } from './seo-recommendations'
import { HeadingStructure } from './heading-structure'
import { ImageAltChecker } from './image-alt-checker'
import { ReadabilityIndicator } from './readability-indicator'
import { KeywordSuggestions } from './keyword-suggestions'

interface SEOPanelProps {
  title: string
  content: string
  slug: string
  excerpt?: string
  metaDescription?: string
  onAnalysisComplete?: (scores: { seoScore: number; readabilityScore: number }) => void
}

export function SEOPanel({ title, content, slug, excerpt, metaDescription, onAnalysisComplete }: SEOPanelProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (!title || !content) {
      setTimeout(() => setAnalysis(null), 0)
      return
    }

    setTimeout(() => {
      setIsAnalyzing(true)

      // Extract headings
      const headings = extractHeadings(content).map(h => `h${h.level}:${h.text}`)

      // Extract images (missingAltImages only has src and index, not alt)
      const images = analyzeImages(content).missingAltImages.map((img) => ({
        alt: undefined as string | undefined,
        src: img.src,
      }))

      // Perform comprehensive SEO analysis
      const seoAnalysis = calculateSEOScore({
        title,
        metaDescription: metaDescription || excerpt || '',
        content,
        slug,
        excerpt: excerpt || '',
        headings,
        images,
        wordCount: analyzeContentLength(content).wordCount,
      })

      // Calculate readability (to pass back to parent)
      const readability = calculateReadability(content)

      setAnalysis(seoAnalysis)
      setIsAnalyzing(false)

      if (onAnalysisComplete) {
        onAnalysisComplete({
          seoScore: seoAnalysis.score,
          readabilityScore: readability.score
        })
      }
    }, 0)
  }, [title, content, slug, excerpt, metaDescription, onAnalysisComplete])

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Analyzing content...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Enter title and content to analyze</p>
        </CardContent>
      </Card>
    )
  }

  const scoreColor =
    analysis.score >= 80
      ? 'text-green-500'
      : analysis.score >= 60
        ? 'text-yellow-500'
        : 'text-red-500'

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <SEOScore score={analysis.score} />

      {/* Recommendations */}
      <SEORecommendations recommendations={analysis.recommendations} />

      {/* Factor Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SEO Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(analysis.factors).map(([key, factor]) => {
            const percentage = (factor.score / factor.maxScore) * 100
            const factorColor =
              percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Readability */}
      <ReadabilityIndicator content={content} />

      {/* Heading Structure */}
      <HeadingStructure content={content} />

      {/* Image Alt Text */}
      <ImageAltChecker content={content} />

      {/* Keyword Suggestions */}
      <KeywordSuggestions title={title} content={content} excerpt={excerpt || ''} />
    </div>
  )
}





