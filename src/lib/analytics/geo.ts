/**
 * Geographic analysis utilities
 * 
 * Note: For production, consider using a service like ipapi.co, ipgeolocation.io,
 * or MaxMind GeoIP2. This is a simplified version that will need server-side
 * IP geolocation for accurate results.
 */

export interface GeoLocation {
  country: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}

/**
 * Get geographic location (simplified client-side version)
 * 
 * For production, this should be done server-side using the visitor's IP address.
 * Client-side geolocation requires user permission and is not reliable for analytics.
 */
export async function getGeoLocation(): Promise<GeoLocation> {
  // Client-side geolocation requires permission and is not recommended for analytics
  // In production, use server-side IP geolocation service
  
  return {
    country: null, // Will be set server-side via IP geolocation
    city: null, // Will be set server-side via IP geolocation
    latitude: null,
    longitude: null,
  }
}

/**
 * Get country from IP address (server-side only)
 * This should be called from a server action or API route
 */
export async function getCountryFromIP(ipAddress: string): Promise<string | null> {
  try {
    // Example using a free IP geolocation service
    // Replace with your preferred service (ipapi.co, ipgeolocation.io, etc.)
    const response = await fetch(`https://ipapi.co/${ipAddress}/country/`, {
      headers: {
        'Accept': 'text/plain',
      },
    })
    
    if (response.ok) {
      const country = await response.text()
      return country.trim() || null
    }
  } catch (error) {
    console.error('Error getting country from IP:', error)
  }
  
  return null
}

/**
 * Get full location from IP address (server-side only)
 */
export async function getLocationFromIP(ipAddress: string): Promise<GeoLocation> {
  try {
    // Example using ipapi.co (free tier: 1000 requests/day)
    // Replace with your preferred service
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`)
    
    if (response.ok) {
      const data = await response.json()
      return {
        country: data.country_name || data.country_code || null,
        city: data.city || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      }
    }
  } catch (error) {
    console.error('Error getting location from IP:', error)
  }
  
  return {
    country: null,
    city: null,
    latitude: null,
    longitude: null,
  }
}






