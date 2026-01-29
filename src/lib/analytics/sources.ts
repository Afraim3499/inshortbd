/**
 * Traffic source analysis utilities
 */

export type TrafficSource = 'direct' | 'search' | 'social' | 'referral' | 'email' | 'other'

export interface TrafficSourceData {
  source: TrafficSource
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

/**
 * Parse URL search parameters
 */
function getURLParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

/**
 * Get UTM parameters from URL
 */
export function getUTMParams(): {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
} {
  const params = getURLParams()
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  }
}

/**
 * Categorize traffic source based on referrer and UTM parameters
 */
export function categorizeTrafficSource(
  referrer: string | null,
  utmSource: string | null,
  utmMedium: string | null
): TrafficSource {
  // If UTM parameters exist, use them for categorization
  if (utmSource) {
    if (utmMedium === 'social' || utmSource.match(/^(facebook|twitter|linkedin|instagram|tiktok|youtube|reddit)$/i)) {
      return 'social'
    }
    if (utmMedium === 'email' || utmSource.match(/^(mailchimp|sendgrid|email|newsletter)$/i)) {
      return 'email'
    }
    if (utmMedium === 'cpc' || utmMedium === 'paid') {
      return 'search'
    }
    return 'other'
  }

  // No referrer means direct traffic
  if (!referrer || referrer === window.location.hostname) {
    return 'direct'
  }

  const ref = referrer.toLowerCase()

  // Social media domains
  const socialDomains = [
    'facebook.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'instagram.com',
    'tiktok.com',
    'youtube.com',
    'reddit.com',
    'pinterest.com',
    'snapchat.com',
    'whatsapp.com',
    'telegram.org',
  ]
  if (socialDomains.some((domain) => ref.includes(domain))) {
    return 'social'
  }

  // Search engines
  const searchEngines = [
    'google.com',
    'bing.com',
    'yahoo.com',
    'duckduckgo.com',
    'baidu.com',
    'yandex.com',
  ]
  if (searchEngines.some((engine) => ref.includes(engine))) {
    return 'search'
  }

  // Email clients (common patterns)
  if (
    ref.includes('mail.') ||
    ref.includes('email') ||
    ref.includes('outlook') ||
    ref.includes('gmail')
  ) {
    return 'email'
  }

  // Everything else is referral
  return 'referral'
}

/**
 * Get complete traffic source data
 */
export function getTrafficSourceData(): TrafficSourceData {
  if (typeof window === 'undefined') {
    return {
      source: 'other',
      referrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    }
  }

  const utm = getUTMParams()
  const referrer = document.referrer || null

  // Extract hostname from referrer if it exists
  let referrerHostname: string | null = null
  if (referrer) {
    try {
      referrerHostname = new URL(referrer).hostname
    } catch {
      referrerHostname = referrer
    }
  }

  const source = categorizeTrafficSource(referrerHostname, utm.utm_source, utm.utm_medium)

  return {
    source,
    referrer: referrerHostname,
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
    utmCampaign: utm.utm_campaign,
  }
}






