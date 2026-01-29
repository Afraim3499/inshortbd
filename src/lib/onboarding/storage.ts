/**
 * localStorage utilities for onboarding features
 */

const STORAGE_PREFIX = 'inshort_'

/**
 * Get a value from localStorage
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

/**
 * Set a value in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to set localStorage item:', error)
  }
}

/**
 * Remove a value from localStorage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  } catch (error) {
    console.error('Failed to remove localStorage item:', error)
  }
}

/**
 * Check if user has completed the welcome tour
 */
export function hasCompletedTour(userId?: string): boolean {
  const key = userId ? `tour_completed_${userId}` : 'tour_completed'
  return getStorageItem<boolean>(key) === true
}

/**
 * Mark tour as completed
 */
export function markTourCompleted(userId?: string): void {
  const key = userId ? `tour_completed_${userId}` : 'tour_completed'
  setStorageItem(key, true)
}

/**
 * Check if a tooltip has been dismissed
 */
export function isTooltipDismissed(tooltipId: string): boolean {
  return getStorageItem<boolean>(`tooltip_dismissed_${tooltipId}`) === true
}

/**
 * Mark a tooltip as dismissed
 */
export function dismissTooltip(tooltipId: string): void {
  setStorageItem(`tooltip_dismissed_${tooltipId}`, true)
}

/**
 * Get help sidebar open state
 */
export function getHelpSidebarState(): boolean {
  return getStorageItem<boolean>('help_sidebar_open') ?? false
}

/**
 * Set help sidebar open state
 */
export function setHelpSidebarState(open: boolean): void {
  setStorageItem('help_sidebar_open', open)
}






