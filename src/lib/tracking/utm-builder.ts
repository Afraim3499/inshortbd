/**
 * UTM parameter builder and validation utilities
 */

export interface UTMParams {
  source: string // Required: utm_source
  medium: string // Required: utm_medium
  campaign: string // Required: utm_campaign
  term?: string // Optional: utm_term
  content?: string // Optional: utm_content
}

export interface UTMValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate UTM parameters
 */
export function validateUTMParams(params: Partial<UTMParams>): UTMValidationResult {
  const errors: string[] = []

  if (!params.source || params.source.trim().length === 0) {
    errors.push('Source is required')
  }

  if (!params.medium || params.medium.trim().length === 0) {
    errors.push('Medium is required')
  }

  if (!params.campaign || params.campaign.trim().length === 0) {
    errors.push('Campaign is required')
  }

  // Validate length (Google Analytics limit is 100 characters)
  if (params.source && params.source.length > 100) {
    errors.push('Source must be 100 characters or less')
  }

  if (params.medium && params.medium.length > 100) {
    errors.push('Medium must be 100 characters or less')
  }

  if (params.campaign && params.campaign.length > 100) {
    errors.push('Campaign must be 100 characters or less')
  }

  if (params.term && params.term.length > 100) {
    errors.push('Term must be 100 characters or less')
  }

  if (params.content && params.content.length > 100) {
    errors.push('Content must be 100 characters or less')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Build a UTM-tracked URL
 */
export function buildUTMUrl(baseUrl: string, params: UTMParams): string {
  const url = new URL(baseUrl)

  // Remove existing UTM parameters
  url.searchParams.delete('utm_source')
  url.searchParams.delete('utm_medium')
  url.searchParams.delete('utm_campaign')
  url.searchParams.delete('utm_term')
  url.searchParams.delete('utm_content')

  // Add new UTM parameters
  url.searchParams.set('utm_source', params.source.trim())
  url.searchParams.set('utm_medium', params.medium.trim())
  url.searchParams.set('utm_campaign', params.campaign.trim())

  if (params.term && params.term.trim().length > 0) {
    url.searchParams.set('utm_term', params.term.trim())
  }

  if (params.content && params.content.trim().length > 0) {
    url.searchParams.set('utm_content', params.content.trim())
  }

  return url.toString()
}

/**
 * Parse UTM parameters from a URL
 */
export function parseUTMFromUrl(url: string): Partial<UTMParams> {
  try {
    const urlObj = new URL(url)
    const params: Partial<UTMParams> = {}

    const source = urlObj.searchParams.get('utm_source')
    const medium = urlObj.searchParams.get('utm_medium')
    const campaign = urlObj.searchParams.get('utm_campaign')
    const term = urlObj.searchParams.get('utm_term')
    const content = urlObj.searchParams.get('utm_content')

    if (source) params.source = source
    if (medium) params.medium = medium
    if (campaign) params.campaign = campaign
    if (term) params.term = term
    if (content) params.content = content

    return params
  } catch {
    return {}
  }
}

/**
 * Get preset UTM templates for common platforms
 */
export function getUTMTemplates(): Record<string, Partial<UTMParams>> {
  return {
    twitter: {
      source: 'twitter',
      medium: 'social',
      campaign: '',
    },
    facebook: {
      source: 'facebook',
      medium: 'social',
      campaign: '',
    },
    linkedin: {
      source: 'linkedin',
      medium: 'social',
      campaign: '',
    },
    email: {
      source: 'newsletter',
      medium: 'email',
      campaign: '',
    },
    'google-ads': {
      source: 'google',
      medium: 'cpc',
      campaign: '',
    },
    'organic-search': {
      source: 'google',
      medium: 'organic',
      campaign: '',
    },
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch {
    return false
  }
}






