/**
 * Image SEO Analysis
 * Checks for alt text, image optimization, and SEO best practices
 */

export interface ImageSEOAnalysis {
  totalImages: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  missingAltImages: Array<{ src?: string; index: number }>
  score: number
  recommendations: string[]
}

/**
 * Extract images from HTML content
 */
export function extractImages(content: string): Array<{ alt?: string; src?: string }> {
  const images: Array<{ alt?: string; src?: string }> = []
  
  // Match img tags
  const imgRegex = /<img[^>]+>/gi
  let match

  while ((match = imgRegex.exec(content)) !== null) {
    const imgTag = match[0]
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i)
    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i)
    
    images.push({
      alt: altMatch ? altMatch[1] : undefined,
      src: srcMatch ? srcMatch[1] : undefined,
    })
  }

  return images
}

/**
 * Analyze images for SEO
 */
export function analyzeImages(content: string): ImageSEOAnalysis {
  const images = extractImages(content)
  const imagesWithAlt = images.filter((img) => img.alt && img.alt.trim().length > 0).length
  const imagesWithoutAlt = images.length - imagesWithAlt
  
  const missingAltImages = images
    .map((img, index) => ({ ...img, index }))
    .filter((img) => !img.alt || img.alt.trim().length === 0)

  let score = 10
  const recommendations: string[] = []

  if (images.length === 0) {
    return {
      totalImages: 0,
      imagesWithAlt: 0,
      imagesWithoutAlt: 0,
      missingAltImages: [],
      score: 5,
      recommendations: ['Consider adding relevant images to improve engagement'],
    }
  }

  if (imagesWithoutAlt > 0) {
    score -= (imagesWithoutAlt / images.length) * 10
    recommendations.push(`${imagesWithoutAlt} image(s) missing alt text`)
    recommendations.push('Add descriptive alt text for better accessibility and SEO')
  }

  // Check for empty alt text
  const emptyAltCount = images.filter((img) => img.alt === '').length
  if (emptyAltCount > 0) {
    recommendations.push(`${emptyAltCount} image(s) have empty alt text`)
    recommendations.push('Remove alt attribute or add descriptive text')
  }

  // Check alt text quality
  images.forEach((img, index) => {
    if (img.alt && img.alt.length < 3) {
      recommendations.push(`Image ${index + 1} has very short alt text - be more descriptive`)
    }
    if (img.alt && img.alt.length > 125) {
      recommendations.push(`Image ${index + 1} has very long alt text - keep it concise`)
    }
  })

  return {
    totalImages: images.length,
    imagesWithAlt,
    imagesWithoutAlt,
    missingAltImages,
    score: Math.max(0, Math.round(score)),
    recommendations,
  }
}

/**
 * Validate alt text quality
 */
export function validateAltText(altText: string): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (!altText || altText.trim().length === 0) {
    return { valid: false, issues: ['Alt text is required'] }
  }

  if (altText.length < 3) {
    issues.push('Alt text is too short - be more descriptive')
  }

  if (altText.length > 125) {
    issues.push('Alt text is too long - keep it concise')
  }

  // Check for common mistakes
  if (altText.toLowerCase().startsWith('image of') || altText.toLowerCase().startsWith('picture of')) {
    issues.push("Avoid starting with 'image of' or 'picture of'")
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}






