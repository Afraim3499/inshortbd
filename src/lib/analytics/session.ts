/**
 * Session management utilities for analytics
 */

/**
 * Generate or retrieve session ID from cookies/localStorage
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  // Try to get from sessionStorage first (per-tab session)
  let sessionId = sessionStorage.getItem('analytics_session_id')
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  
  return sessionId
}

/**
 * Get session expiration time (30 minutes)
 */
export function getSessionExpiry(): number {
  return Date.now() + 30 * 60 * 1000 // 30 minutes
}

/**
 * Check if session is expired
 */
export function isSessionExpired(expiry: number): boolean {
  return Date.now() > expiry
}

/**
 * Clear session ID
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('analytics_session_id')
  }
}






