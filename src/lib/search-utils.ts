/**
 * Search utility functions with security considerations
 */

/**
 * Escape special characters in search query for Supabase PostgREST
 * Supabase uses PostgREST which has built-in parameterization, but we should
 * still sanitize user input for safety
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove null bytes and trim
  return query.replace(/\0/g, '').trim()
}

/**
 * Build safe search filter for Supabase queries
 * Uses PostgREST's built-in sanitization, but we validate input first
 */
export function buildSearchFilter(query: string, fields: string[]): string {
  const sanitized = sanitizeSearchQuery(query)
  
  if (!sanitized) {
    return ''
  }

  // Escape special PostgREST operators
  const escaped = sanitized.replace(/[%_]/g, (char) => `\\${char}`)
  
  // Build OR filter for multiple fields
  // Format: field1.ilike.%query%,field2.ilike.%query%
  return fields.map((field) => `${field}.ilike.%${escaped}%`).join(',')
}






