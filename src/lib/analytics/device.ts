/**
 * Device and browser detection utilities
 */

export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  browserVersion: string
  os: string
  osVersion: string
}

/**
 * Detect device type from user agent
 */
export function detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (!userAgent) return 'unknown'

  const ua = userAgent.toLowerCase()

  // Check for tablet first (tablets often have mobile in user agent)
  if (
    ua.includes('ipad') ||
    ua.includes('tablet') ||
    (ua.includes('android') && !ua.includes('mobile')) ||
    ua.includes('playbook') ||
    ua.includes('kindle')
  ) {
    return 'tablet'
  }

  // Check for mobile
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone') ||
    ua.includes('ipod') ||
    ua.includes('blackberry') ||
    ua.includes('windows phone')
  ) {
    return 'mobile'
  }

  // Default to desktop
  return 'desktop'
}

/**
 * Detect browser from user agent
 */
export function detectBrowser(userAgent: string): { browser: string; version: string } {
  if (!userAgent) return { browser: 'unknown', version: 'unknown' }

  const ua = userAgent.toLowerCase()

  // Chrome (includes Edge on Chromium)
  if (ua.includes('edg/')) {
    return { browser: 'Edge', version: extractVersion(ua, 'edg/') }
  }
  if (ua.includes('chrome/') && !ua.includes('edg/')) {
    return { browser: 'Chrome', version: extractVersion(ua, 'chrome/') }
  }

  // Firefox
  if (ua.includes('firefox/')) {
    return { browser: 'Firefox', version: extractVersion(ua, 'firefox/') }
  }

  // Safari
  if (ua.includes('safari/') && !ua.includes('chrome/')) {
    return { browser: 'Safari', version: extractVersion(ua, 'version/') || 'unknown' }
  }

  // Opera
  if (ua.includes('opr/') || ua.includes('opera/')) {
    return { browser: 'Opera', version: extractVersion(ua, 'opr/') || extractVersion(ua, 'version/') || 'unknown' }
  }

  return { browser: 'unknown', version: 'unknown' }
}

/**
 * Detect operating system from user agent
 */
export function detectOS(userAgent: string): { os: string; version: string } {
  if (!userAgent) return { os: 'unknown', version: 'unknown' }

  const ua = userAgent.toLowerCase()

  // Windows
  if (ua.includes('windows')) {
    if (ua.includes('windows nt 10.0')) return { os: 'Windows', version: '10/11' }
    if (ua.includes('windows nt 6.3')) return { os: 'Windows', version: '8.1' }
    if (ua.includes('windows nt 6.2')) return { os: 'Windows', version: '8' }
    if (ua.includes('windows nt 6.1')) return { os: 'Windows', version: '7' }
    return { os: 'Windows', version: 'unknown' }
  }

  // macOS
  if (ua.includes('mac os x') || ua.includes('macintosh')) {
    const version = extractVersion(ua, 'mac os x ')
    return { os: 'macOS', version: version || 'unknown' }
  }

  // iOS
  if (ua.includes('iphone os') || ua.includes('ipad')) {
    const version = extractVersion(ua, 'os ')
    return { os: 'iOS', version: version || 'unknown' }
  }

  // Android
  if (ua.includes('android')) {
    const version = extractVersion(ua, 'android ')
    return { os: 'Android', version: version || 'unknown' }
  }

  // Linux
  if (ua.includes('linux')) {
    return { os: 'Linux', version: 'unknown' }
  }

  return { os: 'unknown', version: 'unknown' }
}

/**
 * Get complete device information
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'unknown',
      browser: 'unknown',
      browserVersion: 'unknown',
      os: 'unknown',
      osVersion: 'unknown',
    }
  }

  const userAgent = navigator.userAgent
  const deviceType = detectDeviceType(userAgent)
  const browser = detectBrowser(userAgent)
  const os = detectOS(userAgent)

  return {
    deviceType,
    browser: browser.browser,
    browserVersion: browser.version,
    os: os.os,
    osVersion: os.version,
  }
}

/**
 * Extract version number from user agent string
 */
function extractVersion(ua: string, prefix: string): string {
  const index = ua.indexOf(prefix)
  if (index === -1) return 'unknown'

  const start = index + prefix.length
  const end = ua.indexOf(' ', start)
  const version = end !== -1 ? ua.substring(start, end) : ua.substring(start)
  
  // Clean up version string
  return version.replace(/[^0-9.]/g, '').substring(0, 10) || 'unknown'
}






