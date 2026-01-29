/**
 * Heading Structure Analysis
 * Analyzes heading hierarchy and structure for SEO
 */

export interface HeadingAnalysis {
  hasH1: boolean
  h1Count: number
  headingCount: number
  hierarchy: Array<{ level: number; text: string; issues: string[] }>
  issues: string[]
  score: number
}

/**
 * Extract headings from HTML content
 */
export function extractHeadings(content: string): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = []
  
  // Match h1-h6 tags
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const text = match[2].replace(/<[^>]*>/g, '').trim()
    if (text) {
      headings.push({ level, text })
    }
  }

  return headings
}

/**
 * Analyze heading structure
 */
export function analyzeHeadings(content: string): HeadingAnalysis {
  const headings = extractHeadings(content)
  const issues: string[] = []
  let score = 10

  if (headings.length === 0) {
    return {
      hasH1: false,
      h1Count: 0,
      headingCount: 0,
      hierarchy: [],
      issues: ['No headings found in content'],
      score: 0,
    }
  }

  // Check for H1
  const h1Headings = headings.filter((h) => h.level === 1)
  const hasH1 = h1Headings.length > 0
  const h1Count = h1Headings.length

  if (!hasH1) {
    issues.push('Missing H1 heading - use one H1 for the main title')
    score -= 3
  } else if (h1Count > 1) {
    issues.push(`Multiple H1 headings found (${h1Count}) - use only one H1`)
    score -= 2
  }

  // Check heading hierarchy
  const hierarchy = headings.map((heading, index) => {
    const headingIssues: string[] = []

    if (index > 0) {
      const prevLevel = headings[index - 1].level
      if (heading.level - prevLevel > 1) {
        headingIssues.push(
          `Skipped from H${prevLevel} to H${heading.level} - maintain proper hierarchy`
        )
        score -= 1
      }
    }

    return {
      level: heading.level,
      text: heading.text.length > 50 ? heading.text.substring(0, 50) + '...' : heading.text,
      issues: headingIssues,
    }
  })

  // Check for too many headings
  if (headings.length < 2) {
    issues.push('Consider adding more headings to structure your content')
    score -= 1
  }

  return {
    hasH1,
    h1Count,
    headingCount: headings.length,
    hierarchy,
    issues,
    score: Math.max(0, score),
  }
}

/**
 * Get heading structure visualization
 */
export function getHeadingStructure(headings: Array<{ level: number; text: string }>): string {
  if (headings.length === 0) return 'No headings found'

  return headings
    .map((h) => {
      const indent = '  '.repeat(h.level - 1)
      return `${indent}H${h.level}: ${h.text.substring(0, 60)}`
    })
    .join('\n')
}






