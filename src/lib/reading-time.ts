import { generateText } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

/**
 * Calculate reading time in minutes based on word count
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(content: any): number {
  if (!content) return 1

  // Extract plain text from Tiptap JSON content
  try {
    const text = generateText(content, [StarterKit, TextStyle, Color, Link, Image])
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const readingTime = Math.ceil(words / 225) // Using 225 as average reading speed
    return Math.max(1, readingTime) // Minimum 1 minute
  } catch (error) {
    console.error('Error calculating reading time:', error)
    return 1
  }
}






