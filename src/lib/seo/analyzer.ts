/**
 * SEO Analyzer - Comprehensive SEO scoring and analysis
 * Calculates overall SEO score based on multiple factors
 */

import {
  countWords,
} from './length'

/**
 * Check if text contains Bangla characters
 */
function isBangla(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text)
}

export interface SEOAnalysis {
  score: number
  factors: {
    title: { score: number; maxScore: number; issues: string[] }
    metaDescription: { score: number; maxScore: number; issues: string[] }
    headings: { score: number; maxScore: number; issues: string[] }
    contentLength: { score: number; maxScore: number; issues: string[] }
    keywords: { score: number; maxScore: number; issues: string[] }
    images: { score: number; maxScore: number; issues: string[] }
    links: { score: number; maxScore: number; issues: string[] }
    readability: { score: number; maxScore: number; issues: string[] }
  }
  recommendations: string[]
}

interface AnalyzerInput {
  title: string
  metaDescription?: string
  content: string
  slug: string
  excerpt?: string
  headings?: string[]
  images?: Array<{ alt?: string; src?: string }>
  wordCount?: number
}

/**
 * Calculate overall SEO score (0-100)
 */
export function calculateSEOScore(input: AnalyzerInput): SEOAnalysis {
  // Sanitize content to ensure it's a string (handles potential Tiptap JSON or nulls)
  const safeContent = typeof input.content === 'string' ? input.content : ''
  const wordCount = input.wordCount || countWords(safeContent)

  const factors = {
    title: analyzeTitle(input.title),
    metaDescription: analyzeMetaDescription(input.metaDescription || ''),
    headings: analyzeHeadings(input.headings || [], input.title),
    contentLength: analyzeContentLength(wordCount),
    keywords: analyzeKeywords(input.title, safeContent, input.excerpt || ''),
    images: analyzeImages(input.images || []),
    links: analyzeLinks(safeContent),
    readability: analyzeReadability(safeContent),
  }

  // Weighted scoring
  const weights = {
    title: 15,
    metaDescription: 10,
    headings: 10,
    contentLength: 15,
    keywords: 15,
    images: 10,
    links: 10,
    readability: 15,
  }

  let totalScore = 0
  let totalMaxScore = 0

  Object.entries(factors).forEach(([key, factor]) => {
    const weight = weights[key as keyof typeof weights]
    totalScore += (factor.score / factor.maxScore) * weight
    totalMaxScore += weight
  })

  const overallScore = Math.round((totalScore / totalMaxScore) * 100)

  // Generate recommendations
  const recommendations: string[] = []
  if (factors.title.score < factors.title.maxScore) {
    recommendations.push(...factors.title.issues)
  }
  if (factors.metaDescription.score < factors.metaDescription.maxScore) {
    recommendations.push(...factors.metaDescription.issues)
  }
  if (factors.contentLength.score < factors.contentLength.maxScore) {
    recommendations.push(...factors.contentLength.issues)
  }
  if (factors.keywords.score < factors.keywords.maxScore) {
    recommendations.push(...factors.keywords.issues)
  }
  if (factors.images.score < factors.images.maxScore) {
    recommendations.push(...factors.images.issues)
  }
  if (factors.headings.score < factors.headings.maxScore) {
    recommendations.push(...factors.headings.issues)
  }
  if (factors.readability.score < factors.readability.maxScore) {
    recommendations.push(...factors.readability.issues)
  }

  return {
    score: overallScore,
    factors,
    recommendations,
  }
}

/**
 * Analyze title tag
 */
function analyzeTitle(title: string): { score: number; maxScore: number; issues: string[] } {
  const issues: string[] = []
  let score = 10

  const length = title.length

  if (length === 0) {
    return { score: 0, maxScore: 10, issues: ['Title is required'] }
  }

  if (length < 30) {
    issues.push('Title is too short (aim for 50-60 characters)')
    score -= 3
  } else if (length > 60) {
    issues.push('Title may be truncated in search results (aim for 50-60 characters)')
    score -= 2
  }

  // Skip capitalization check for Bangla (no uppercase concept)
  if (!isBangla(title) && !title.match(/[A-Z]/)) {
    issues.push('Consider capitalizing important words')
    score -= 1
  }

  return { score: Math.max(0, score), maxScore: 10, issues }
}

/**
 * Analyze meta description
 */
function analyzeMetaDescription(
  metaDescription: string
): { score: number; maxScore: number; issues: string[] } {
  const issues: string[] = []
  let score = 10

  const length = metaDescription.length

  if (length === 0) {
    return { score: 0, maxScore: 10, issues: ['Meta description is missing'] }
  }

  if (length < 120) {
    issues.push('Meta description is too short (aim for 150-160 characters)')
    score -= 3
  } else if (length > 160) {
    issues.push('Meta description may be truncated in search results (aim for 150-160 characters)')
    score -= 2
  }

  if (!metaDescription.match(/[.!?]$/)) {
    issues.push('Consider ending with punctuation for better readability')
    score -= 1
  }

  return { score: Math.max(0, score), maxScore: 10, issues }
}

/**
 * Analyze heading structure
 */
function analyzeHeadings(headings: string[], title: string = ''): { score: number; maxScore: number; issues: string[] } {
  const issues: string[] = []
  let score = 10

  // If title is present, we consider H1 as present implicitly for the page
  const hasTitleH1 = title.trim().length > 0

  if (headings.length === 0 && !hasTitleH1) {
    return { score: 5, maxScore: 10, issues: ['No headings found in content'] }
  }

  // Check for H1
  const contentH1s = headings.filter((h) => h.startsWith('h1:'))

  if (!hasTitleH1 && contentH1s.length === 0) {
    issues.push('Missing H1 heading')
    score -= 3
  } else if (hasTitleH1 && contentH1s.length > 0) {
    issues.push('Content contains H1. Since Title is used as H1, use H2-H6 in content.')
    score -= 2
  } else if (!hasTitleH1 && contentH1s.length > 1) {
    issues.push('Multiple H1 headings found (use only one H1)')
    score -= 2
  }

  // Check heading hierarchy
  const headingLevels = headings.map((h) => parseInt(h.split(':')[0].replace('h', '')))
  let previousLevel = hasTitleH1 ? 1 : 0

  for (let i = 0; i < headingLevels.length; i++) {
    const currentLevel = headingLevels[i]
    if (previousLevel !== 0 && currentLevel - previousLevel > 1) {
      issues.push('Heading hierarchy skipped levels')
      score -= 2
      break
    }
    previousLevel = currentLevel
  }

  if (headings.length < 2 && !hasTitleH1) {
    issues.push('Consider adding more headings to structure your content')
    score -= 1
  }

  return { score: Math.max(0, score), maxScore: 10, issues }
}

/**
 * Analyze content length
 */
function analyzeContentLength(
  wordCount: number
): { score: number; maxScore: number; issues: string[] } {
  const issues: string[] = []
  let score = 10

  if (wordCount < 300) {
    issues.push('Content is too short (aim for at least 300 words)')
    score -= 5
  } else if (wordCount < 500) {
    issues.push('Consider expanding content to at least 500 words for better SEO')
    score -= 2
  }

  if (wordCount > 3000) {
    issues.push('Content is very long - consider breaking into multiple articles')
    score -= 1
  }

  return { score: Math.max(0, score), maxScore: 10, issues }
}

/**
 * Analyze keyword usage
 */
function analyzeKeywords(
  title: string,
  content: string,
  excerpt: string
): { score: number; maxScore: number; issues: string[] } {
  const issues: string[] = []
  let score = 10

  // Extract keywords from title (use shorter min length for Bangla)
  const minWordLength = isBangla(title) ? 1 : 3
  const titleWords = title.toLowerCase().split(/[\s\u200B]+/).filter((w) => w.length > minWordLength)
  const contentLower = content.toLowerCase()
  const excerptLower = excerpt.toLowerCase()

  if (titleWords.length === 0) {
    return { score: 5, maxScore: 10, issues: ['No keywords found in title'] }
  }

  // Check if title keywords appear in content
  let keywordsInContent = 0
  titleWords.forEach((word) => {
    if (contentLower.includes(word) || excerptLower.includes(word)) {
      keywordsInContent++
    }
  })

  const keywordRatio = keywordsInContent / titleWords.length
  if (keywordRatio < 0.5) {
    issues.push('Title keywords should appear in content and excerpt')
    score -= 3
  }

  return { score: Math.max(0, score), maxScore: 10, issues }
}

/**
 * Analyze images
 */
function analyzeImages(
  images: Array<{ alt?: string; src?: string }>
): { score: number; maxScore: number; issues: string[] } {
  const issues: string[] = []
  let score = 10

  if (images.length === 0) {
    return { score: 5, maxScore: 10, issues: ['No images found - consider adding relevant images'] }
  }

  const imagesWithoutAlt = images.filter((img) => !img.alt || img.alt.trim() === '')
  if (imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} image(s) missing alt text`)
    score -= imagesWithoutAlt.length * 2
  }

  return { score: Math.max(0, score), maxScore: 10, issues }
}

/**
 * Analyze internal/external links
 */
function analyzeLinks(content: string): { score: number; maxScore: number; issues: string[] } {
  const issues: string[] = []
  let score = 10

  // Count links (simplified - look for href attributes)
  const linkMatches = content.match(/href=["']([^"']+)["']/g) || []
  const internalLinks = linkMatches.filter((link) => !link.match(/^https?:\/\//))

  if (linkMatches.length === 0) {
    issues.push('No links found - consider adding internal or external links')
    score -= 3
  } else if (internalLinks.length === 0) {
    issues.push('No internal links found - consider linking to related articles')
    score -= 2
  }

  return { score: Math.max(0, score), maxScore: 10, issues }
}

/**
 * Analyze readability (simplified Flesch score)
 */
function analyzeReadability(content: string): { score: number; maxScore: number; issues: string[] } {
  const issues: string[] = []
  let score = 10

  const sentences = content.split(/[.!?\u0964|]+/).filter((s) => s.trim().length > 0)
  const words = content.split(/[\s\u200B]+/).filter((w) => w.length > 0)
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0)

  if (sentences.length === 0 || words.length === 0) {
    return { score: 5, maxScore: 10, issues: ['Content appears to be empty'] }
  }

  const avgSentenceLength = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  // Simplified Flesch Reading Ease score
  const fleschScore = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord

  if (fleschScore < 30) {
    issues.push('Content is very difficult to read - simplify sentence structure')
    score -= 3
  } else if (fleschScore < 50) {
    issues.push('Content is somewhat difficult - consider shorter sentences')
    score -= 2
  } else if (fleschScore > 80) {
    issues.push('Content may be too simple - consider more varied vocabulary')
    score -= 1
  }

  return { score: Math.max(0, score), maxScore: 10, issues }
}



/**
 * Count syllables in a word (simplified)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}






