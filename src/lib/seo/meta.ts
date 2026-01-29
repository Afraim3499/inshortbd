/**
 * Meta Tag Optimization Utilities
 * Analyzes and optimizes meta descriptions and title tags
 */

export interface MetaAnalysis {
  title: {
    length: number
    optimal: boolean
    issues: string[]
    suggestion?: string
  }
  metaDescription: {
    length: number
    optimal: boolean
    issues: string[]
    suggestion?: string
  }
}

/**
 * Analyze meta tags
 */
export function analyzeMetaTags(
  title: string,
  metaDescription: string
): MetaAnalysis {
  return {
    title: analyzeTitle(title),
    metaDescription: analyzeMetaDescription(metaDescription),
  }
}

/**
 * Analyze title tag
 */
function analyzeTitle(title: string): {
  length: number
  optimal: boolean
  issues: string[]
  suggestion?: string
} {
  const length = title.length
  const issues: string[] = []
  let optimal = true

  if (length === 0) {
    return {
      length: 0,
      optimal: false,
      issues: ['Title is required'],
    }
  }

  if (length < 30) {
    issues.push('Title is too short (aim for 50-60 characters)')
    optimal = false
  } else if (length > 60) {
    issues.push('Title may be truncated in search results (optimal: 50-60 characters)')
    optimal = false
  }

  // Skip capitalization check for Bangla
  const isBangla = /[\u0980-\u09FF]/.test(title)
  if (!isBangla && !title.match(/^[A-Z]/)) {
    issues.push('Consider starting title with capital letter')
  }

  return {
    length,
    optimal,
    issues,
  }
}

/**
 * Analyze meta description
 */
function analyzeMetaDescription(metaDescription: string): {
  length: number
  optimal: boolean
  issues: string[]
  suggestion?: string
} {
  const length = metaDescription.length
  const issues: string[] = []
  let optimal = true

  if (length === 0) {
    return {
      length: 0,
      optimal: false,
      issues: ['Meta description is missing'],
    }
  }

  if (length < 120) {
    issues.push('Meta description is too short (aim for 150-160 characters)')
    optimal = false
  } else if (length > 160) {
    issues.push(
      'Meta description may be truncated in search results (optimal: 150-160 characters)'
    )
    optimal = false
  }

  // Check for call to action
  const hasCTA = /(learn|read|discover|explore|find|get|see|view|জানুন|পড়ুন|দেখুন|ক্লিক করুন|বিস্তারিত)/i.test(metaDescription)
  if (!hasCTA) {
    issues.push('Consider adding a call-to-action word')
  }

  return {
    length,
    optimal,
    issues,
  }
}

/**
 * Optimize title length
 */
export function optimizeTitleLength(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) return title

  // Try to cut at word boundary
  const truncated = title.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}

/**
 * Optimize meta description length
 */
export function optimizeMetaDescriptionLength(
  description: string,
  maxLength: number = 160
): string {
  if (description.length <= maxLength) return description

  // Try to cut at sentence boundary
  const truncated = description.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastExclamation = truncated.lastIndexOf('!')
  const lastQuestion = truncated.lastIndexOf('?')
  const lastPunctuation = Math.max(lastPeriod, lastExclamation, lastQuestion)

  if (lastPunctuation > maxLength * 0.7) {
    return truncated.substring(0, lastPunctuation + 1)
  }

  // Cut at word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}






