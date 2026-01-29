/**
 * Content Length Analysis
 * Analyzes content length and provides recommendations
 */

export interface ContentLengthAnalysis {
  wordCount: number
  characterCount: number
  paragraphCount: number
  optimal: boolean
  score: number
  recommendations: string[]
}

/**
 * Count words in content (HTML stripped)
 */
export function countWords(content: string): number {
  if (typeof content !== 'string') return 0
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!plainText) return 0
  return plainText.split(/[\s\u200B]+/).filter((w) => w.trim().length > 0).length
}

/**
 * Count characters in content (HTML stripped)
 */
export function countCharacters(content: string): number {
  if (typeof content !== 'string') return 0
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return plainText.length
}

/**
 * Count paragraphs in content
 */
export function countParagraphs(content: string): number {
  if (typeof content !== 'string') return 0
  const paragraphs = content.match(/<p[^>]*>.*?<\/p>/gi) || []
  return paragraphs.length
}

/**
 * Analyze content length
 */
export function analyzeContentLength(content: string): ContentLengthAnalysis {
  const wordCount = countWords(content)
  const characterCount = countCharacters(content)
  const paragraphCount = countParagraphs(content)

  let score = 10
  let optimal = true
  const recommendations: string[] = []

  // Word count recommendations
  if (wordCount < 300) {
    optimal = false
    score -= 5
    recommendations.push('Content is too short - aim for at least 300 words')
    recommendations.push('Short content typically ranks lower in search results')
  } else if (wordCount < 500) {
    optimal = false
    score -= 2
    recommendations.push('Consider expanding to at least 500 words for better SEO')
  } else if (wordCount >= 500 && wordCount <= 2000) {
    recommendations.push('Good content length for SEO')
  } else if (wordCount > 3000) {
    score -= 1
    recommendations.push('Content is very long - consider breaking into multiple articles or using pagination')
  }

  // Paragraph count
  if (paragraphCount < 3 && wordCount > 100) {
    recommendations.push('Consider breaking content into more paragraphs for readability')
  }

  // Character count (for meta purposes)
  if (characterCount < 1200) {
    recommendations.push('Content may benefit from more detailed explanations')
  }

  return {
    wordCount,
    characterCount,
    paragraphCount,
    optimal,
    score: Math.max(0, score),
    recommendations,
  }
}

/**
 * Get content length recommendations based on target word count
 */
export function getContentLengthRecommendations(wordCount: number, targetWords: number = 1000): string[] {
  const recommendations: string[] = []
  const difference = targetWords - wordCount

  if (difference > 0) {
    recommendations.push(`Add approximately ${difference} more words to reach optimal length`)
    recommendations.push('Consider: examples, case studies, additional explanations, or related topics')
  } else if (difference < -500) {
    recommendations.push('Content exceeds optimal length - consider splitting into multiple articles')
  } else {
    recommendations.push('Content length is optimal')
  }

  return recommendations
}






