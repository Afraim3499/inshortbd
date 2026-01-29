'use client'

import { useState, useEffect } from 'react'
import { analyzeMetaTags, optimizeMetaDescriptionLength } from '@/lib/seo/meta'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react'

interface MetaEditorProps {
  title: string
  metaDescription: string
  onMetaDescriptionChange: (value: string) => void
}

export function MetaEditor({
  title,
  metaDescription,
  onMetaDescriptionChange,
}: MetaEditorProps) {
  const analysis = analyzeMetaTags(title, metaDescription)
  const optimizedLength = optimizeMetaDescriptionLength(metaDescription)

  const descriptionLength = metaDescription.length
  const isOptimal = analysis.metaDescription.optimal
  const lengthColor =
    descriptionLength >= 150 && descriptionLength <= 160
      ? 'text-green-500'
      : descriptionLength < 120
        ? 'text-red-500'
        : 'text-yellow-500'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Meta Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">Title</Label>
            <Badge variant={analysis.title.optimal ? 'default' : 'destructive'}>
              {analysis.title.length} / 60 chars
            </Badge>
          </div>
          <div className="text-sm p-3 bg-muted rounded-md font-medium">{title}</div>
          {analysis.title.issues.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.title.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Meta Description Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Badge variant={isOptimal ? 'default' : 'destructive'}>
              <span className={lengthColor}>{descriptionLength}</span> / 160 chars
            </Badge>
          </div>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Write a compelling meta description that summarizes your article..."
            className="min-h-[100px] font-sans"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            Optimal length: 150-160 characters. This appears in search results.
          </p>

          {analysis.metaDescription.issues.length > 0 && (
            <Alert variant={isOptimal ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.metaDescription.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {isOptimal && descriptionLength > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Meta description length is optimal!</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {metaDescription && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold mb-2">Preview:</p>
              <div className="p-3 bg-muted rounded-md space-y-1">
                <p className="text-sm font-medium text-blue-600 line-clamp-1">{title}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{metaDescription}</p>
                <p className="text-xs text-gray-500">example.com</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}






