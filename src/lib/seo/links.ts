/**
 * Internal/External Link Analysis
 * Analyzes linking structure for SEO optimization
 */

export interface LinkAnalysis {
  totalLinks: number
  internalLinks: number
  externalLinks: number
  linksWithoutText: number
  score: number
  recommendations: string[]
}

/**
 * Extract links from HTML content
 */
export function extractLinks(content: string): Array<{
  href: string
  text: string
  isInternal: boolean
}> {
  const links: Array<{ href: string; text: string; isInternal: boolean }> = []
  
  // Match anchor tags
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1]
    const text = match[2].replace(/<[^>]*>/g, '').trim()
    const isInternal = !href.match(/^https?:\/\//) || href.startsWith('/')

    links.push({
      href,
      text,
      isInternal,
    })
  }

  return links
}

/**
 * Analyze links for SEO
 */
export function analyzeLinks(content: string, baseUrl?: string): LinkAnalysis {
  const links = extractLinks(content)
  
  const internalLinks = links.filter((link) => {
    if (link.isInternal) return true
    if (baseUrl && link.href.startsWith(baseUrl)) return true
    return false
  }).length

  const externalLinks = links.length - internalLinks
  const linksWithoutText = links.filter((link) => !link.text || link.text.trim().length === 0).length

  let score = 10
  const recommendations: string[] = []

  if (links.length === 0) {
    return {
      totalLinks: 0,
      internalLinks: 0,
      externalLinks: 0,
      linksWithoutText: 0,
      score: 5,
      recommendations: [
        'No links found - consider adding internal and external links',
        'Internal links help with SEO and user navigation',
        'External links to authoritative sources add credibility',
      ],
    }
  }

  // Check internal vs external ratio
  if (internalLinks === 0) {
    score -= 3
    recommendations.push('No internal links found - link to related articles')
    recommendations.push('Internal linking improves SEO and keeps readers engaged')
  } else if (internalLinks < 2) {
    score -= 1
    recommendations.push('Consider adding more internal links to related content')
  }

  if (externalLinks === 0 && links.length > 0) {
    recommendations.push('Consider adding external links to authoritative sources')
  }

  // Check for links without text
  if (linksWithoutText > 0) {
    score -= 2
    recommendations.push(`${linksWithoutText} link(s) missing descriptive text`)
    recommendations.push('Use descriptive link text instead of "click here" or empty links')
  }

  // Check link density
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter((w) => w.length > 0).length
  const linkDensity = (links.length / wordCount) * 100

  if (linkDensity < 1) {
    recommendations.push('Link density is low - aim for 1-2 links per 100 words')
  } else if (linkDensity > 5) {
    recommendations.push('Link density is high - avoid over-optimization')
  }

  return {
    totalLinks: links.length,
    internalLinks,
    externalLinks,
    linksWithoutText,
    score: Math.max(0, score),
    recommendations,
  }
}

/**
 * Suggest internal links based on keywords
 */
export function suggestInternalLinks(
  keywords: string[],
  existingLinks: Array<{ href: string; text: string }>
): string[] {
  // This would typically query your database for related articles
  // For now, return empty suggestions
  return []
}






