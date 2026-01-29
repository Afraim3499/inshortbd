/**
 * Readability Analysis
 * Calculates Flesch Reading Ease score and provides recommendations
 */

export interface ReadabilityScore {
  score: number // 0-100
  level: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult' | 'Very Difficult'
  avgSentenceLength: number
  avgWordsPerSentence: number
  recommendations: string[]
}

/**
 * Calculate Flesch Reading Ease score
 * Higher scores indicate easier to read text
 */
export function calculateReadability(content: string): ReadabilityScore {
  // Safe guard: if content is not a string, return default empty score
  if (typeof content !== 'string') {
    return {
      score: 0,
      level: 'Standard',
      avgSentenceLength: 0,
      avgWordsPerSentence: 0,
      recommendations: [],
    }
  }

  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  if (!plainText || plainText.length === 0) {
    return {
      score: 0,
      level: 'Very Difficult',
      avgSentenceLength: 0,
      avgWordsPerSentence: 0,
      recommendations: ['Content appears to be empty'],
    }
  }

  const sentences = plainText.split(/[.!?\u0964|]+/).filter((s) => s.trim().length > 0)
  const words = plainText.split(/[\s\u200B]+/).filter((w) => w.trim().length > 0)
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0)

  if (sentences.length === 0 || words.length === 0) {
    return {
      score: 0,
      level: 'Very Difficult',
      avgSentenceLength: 0,
      avgWordsPerSentence: 0,
      recommendations: ['No sentences found'],
    }
  }

  const avgSentenceLength = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
  const roundedScore = Math.max(0, Math.min(100, Math.round(score)))

  const level = getReadabilityLevel(roundedScore)
  const recommendations = getReadabilityRecommendations(roundedScore, avgSentenceLength)

  return {
    score: roundedScore,
    level,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordsPerSentence: Math.round(avgSentenceLength),
    recommendations,
  }
}

/**
 * Get readability level from score
 */
function getReadabilityLevel(score: number): ReadabilityScore['level'] {
  if (score >= 90) return 'Very Easy'
  if (score >= 80) return 'Easy'
  if (score >= 70) return 'Fairly Easy'
  if (score >= 60) return 'Standard'
  if (score >= 50) return 'Fairly Difficult'
  if (score >= 30) return 'Difficult'
  return 'Very Difficult'
}

/**
 * Get recommendations based on readability score
 */
function getReadabilityRecommendations(
  score: number,
  avgSentenceLength: number
): string[] {
  const recommendations: string[] = []

  if (score < 30) {
    recommendations.push('Content is very difficult to read')
    recommendations.push('Simplify sentence structure')
    recommendations.push('Use shorter words where possible')
  } else if (score < 50) {
    recommendations.push('Content is somewhat difficult')
    recommendations.push('Break up long sentences')
    recommendations.push('Use simpler vocabulary')
  } else if (score < 60) {
    recommendations.push('Consider simplifying some sentences')
    recommendations.push('Aim for score above 60 for better readability')
  } else if (score >= 90) {
    recommendations.push('Content may be too simple for professional audiences')
    recommendations.push('Consider using more varied vocabulary')
  }

  if (avgSentenceLength > 20) {
    recommendations.push('Average sentence length is high - aim for 15-20 words')
  }

  return recommendations
}

/**
 * Count syllables in a word (simplified algorithm)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().trim()

  // Bangla fallback: Use simple heuristic since English vowel rules don't apply
  if (/[\u0980-\u09FF]/.test(word)) {
    return word.length >= 4 ? 2 : 1
  }

  if (word.length <= 3) return 1

  // Remove silent e (English only)
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  // Remove y at start
  word = word.replace(/^y/, '')

  // Count vowel groups
  const vowelMatches = word.match(/[aeiouy]{1,2}/g)
  return vowelMatches ? Math.max(1, vowelMatches.length) : 1
}






