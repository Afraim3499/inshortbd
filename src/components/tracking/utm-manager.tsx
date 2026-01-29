'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  buildUTMUrl,
  validateUTMParams,
  getUTMTemplates,
  parseUTMFromUrl,
  copyToClipboard,
  type UTMParams,
} from '@/lib/tracking/utm-builder'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
// Client-side site URL helper
function getDefaultSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://inshortbd.com'
}

interface UTMManagerProps {
  defaultUrl?: string
  onUrlGenerated?: (url: string) => void
}

export function UTMManager({ defaultUrl, onUrlGenerated }: UTMManagerProps) {
  const [baseUrl, setBaseUrl] = useState(defaultUrl || getDefaultSiteUrl())
  const [params, setParams] = useState<Partial<UTMParams>>({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  })

  const [copied, setCopied] = useState(false)

  // Get templates
  const templates = getUTMTemplates()

  // Derive validation state directly during render
  const validation = validateUTMParams(params)

  // Derive URL directly (no state)
  const generatedUrl = (validation.isValid && params.source && params.medium && params.campaign)
    ? buildUTMUrl(baseUrl, params as UTMParams)
    : ''

  // Notify parent only when URL changes (if needed)
  useEffect(() => {
    if (generatedUrl && onUrlGenerated) {
      onUrlGenerated(generatedUrl)
    }
  }, [generatedUrl, onUrlGenerated])

  const handleTemplateSelect = (templateKey: string) => {
    const template = templates[templateKey]
    if (template) {
      setParams((prev) => ({
        ...prev,
        source: template.source || '',
        medium: template.medium || '',
      }))
    }
  }

  const handleCopy = async () => {
    if (generatedUrl) {
      const success = await copyToClipboard(generatedUrl)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.startsWith('http')) {
        setBaseUrl(text.split('?')[0]) // Remove query params
        const parsed = parseUTMFromUrl(text)
        setParams((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // Clipboard read failed, ignore
    }
  }

  return (
    <div className="space-y-6">
      {/* Base URL */}
      <div className="space-y-2">
        <Label htmlFor="base-url">Base URL</Label>
        <div className="flex gap-2">
          <Input
            id="base-url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="bg-zinc-800 border-zinc-700 text-zinc-50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePasteUrl}
            className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
          >
            Paste
          </Button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="space-y-2">
        <Label>Quick Templates</Label>
        <Select onValueChange={handleTemplateSelect}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-50">
            <SelectValue placeholder="Select a template..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="email">Email Newsletter</SelectItem>
            <SelectItem value="google-ads">Google Ads</SelectItem>
            <SelectItem value="organic-search">Organic Search</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* UTM Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="utm-source">
            Source <span className="text-red-500">*</span>
          </Label>
          <Input
            id="utm-source"
            value={params.source || ''}
            onChange={(e) => setParams((prev) => ({ ...prev, source: e.target.value }))}
            placeholder="google, facebook, newsletter"
            className="bg-zinc-800 border-zinc-700 text-zinc-50"
          />
          <p className="text-xs text-zinc-400">Where the traffic comes from</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="utm-medium">
            Medium <span className="text-red-500">*</span>
          </Label>
          <Input
            id="utm-medium"
            value={params.medium || ''}
            onChange={(e) => setParams((prev) => ({ ...prev, medium: e.target.value }))}
            placeholder="social, email, cpc"
            className="bg-zinc-800 border-zinc-700 text-zinc-50"
          />
          <p className="text-xs text-zinc-400">Marketing medium</p>
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="utm-campaign">
            Campaign <span className="text-red-500">*</span>
          </Label>
          <Input
            id="utm-campaign"
            value={params.campaign || ''}
            onChange={(e) => setParams((prev) => ({ ...prev, campaign: e.target.value }))}
            placeholder="spring_sale, product_launch"
            className="bg-zinc-800 border-zinc-700 text-zinc-50"
          />
          <p className="text-xs text-zinc-400">Campaign name or identifier</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="utm-term">Term (Optional)</Label>
          <Input
            id="utm-term"
            value={params.term || ''}
            onChange={(e) => setParams((prev) => ({ ...prev, term: e.target.value }))}
            placeholder="keyword, ad group"
            className="bg-zinc-800 border-zinc-700 text-zinc-50"
          />
          <p className="text-xs text-zinc-400">Search keywords</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="utm-content">Content (Optional)</Label>
          <Input
            id="utm-content"
            value={params.content || ''}
            onChange={(e) => setParams((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="logo_link, text_link"
            className="bg-zinc-800 border-zinc-700 text-zinc-50"
          />
          <p className="text-xs text-zinc-400">Ad variant identifier</p>
        </div>
      </div>

      {/* Validation Errors */}
      {!validation.isValid && validation.errors.length > 0 && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <p className="text-sm font-medium text-red-400 mb-1">Please fix the following errors:</p>
          <ul className="text-sm text-red-300 list-disc list-inside">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Generated URL Preview */}
      {validation.isValid && generatedUrl && (
        <div className="space-y-2">
          <Label>Generated URL</Label>
          <div className="flex gap-2">
            <Input
              value={generatedUrl}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-zinc-50 font-mono text-sm"
            />
            <Button
              type="button"
              onClick={handleCopy}
              className={cn(
                'bg-blue-500 hover:bg-blue-600 text-white',
                copied && 'bg-green-500 hover:bg-green-600'
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(generatedUrl, '_blank')}
              className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

