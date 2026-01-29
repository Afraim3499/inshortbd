/**
 * Keyword Analysis Utilities
 * Analyzes keyword density, suggestions, and optimization
 */

export interface KeywordAnalysis {
  density: number
  count: number
  position: number
  recommendations: string[]
}

/**
 * Calculate keyword density in content
 */
export function calculateKeywordDensity(keyword: string, content: string): number {
  if (!keyword || !content) return 0
  if (typeof content !== 'string' || typeof keyword !== 'string') return 0

  const keywordLower = keyword.toLowerCase()
  const contentLower = content.toLowerCase()

  // Remove HTML tags and get plain text
  // Remove HTML tags and get plain text
  const plainText = contentLower.replace(/<[^>]*>/g, ' ')
  // Use Unicode-aware split for Bangla support (handling Dondi, Zero-width space)
  const words = plainText.trim().split(/[\s\u200B\u0964]+/).filter((w) => w.length > 0)
  const keywordWords = keywordLower.trim().split(/[\s\u200B\u0964]+/).filter((w) => w.length > 0)

  if (words.length === 0) return 0

  // Count occurrences of keyword phrase
  let count = 0
  for (let i = 0; i <= words.length - keywordWords.length; i++) {
    const phrase = words.slice(i, i + keywordWords.length).join(' ')
    if (phrase === keywordWords.join(' ')) {
      count++
      i += keywordWords.length - 1 // Skip ahead to avoid double counting
    }
  }

  return (count / words.length) * 100
}

/**
 * Get keyword suggestions from title and content
 */
export function getKeywordSuggestions(title: string, content: string, excerpt: string): string[] {
  const suggestions: string[] = []

  // Safe guard for non-string inputs
  if (typeof title !== 'string' || typeof content !== 'string') return suggestions

  // Extract significant words from title
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4 && !isStopWord(w))

  titleWords.forEach((word) => {
    const density = calculateKeywordDensity(word, content)
    if (density > 0.5 && density < 3) {
      // Optimal density range
      suggestions.push(word)
    }
  })

  return suggestions.slice(0, 5) // Return top 5
}

/**
 * Check if word is a stop word
 */
function isStopWord(word: string): boolean {
  const stopWords = [
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'this',
    'that',
    'these',
    'those',
  ]
  return stopWords.includes(word.toLowerCase())
}

/**
 * Analyze keyword usage and provide recommendations
 */
export function analyzeKeyword(
  keyword: string,
  title: string,
  content: string,
  excerpt: string
): KeywordAnalysis {
  // Safe guard for non-string inputs
  const safeKeyword = typeof keyword === 'string' ? keyword : ''
  const safeTitle = typeof title === 'string' ? title : ''
  const safeContent = typeof content === 'string' ? content : ''
  const safeExcerpt = typeof excerpt === 'string' ? excerpt : ''

  const density = calculateKeywordDensity(safeKeyword, safeContent)
  const titleLower = safeTitle.toLowerCase()
  const contentLower = safeContent.toLowerCase()
  const excerptLower = safeExcerpt.toLowerCase()
  const keywordLower = safeKeyword.toLowerCase()

  // Count occurrences
  const titleCount = (titleLower.match(new RegExp(keywordLower, 'g')) || []).length
  const contentCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length
  const excerptCount = (excerptLower.match(new RegExp(keywordLower, 'g')) || []).length
  const totalCount = titleCount + contentCount + excerptCount

  // Find first position in content
  const firstPosition = contentLower.indexOf(keywordLower)
  const position = firstPosition >= 0 ? firstPosition : -1

  const recommendations: string[] = []

  if (titleCount === 0) {
    recommendations.push('Include keyword in title')
  }

  if (excerptCount === 0) {
    recommendations.push('Include keyword in excerpt/meta description')
  }

  if (density < 0.5) {
    recommendations.push('Keyword density is too low (aim for 0.5-2%)')
  } else if (density > 3) {
    recommendations.push('Keyword density is too high - avoid keyword stuffing')
  }

  if (position > 100) {
    recommendations.push('Use keyword earlier in content (first 100 characters)')
  }

  return {
    density: Math.round(density * 100) / 100,
    count: totalCount,
    position,
    recommendations,
  }
}






