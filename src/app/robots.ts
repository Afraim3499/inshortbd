import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: [
      // Default: Allow all legitimate crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/_next/'],
      },
      // Googlebot: Full access
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      // Google News Bot: Full access
      {
        userAgent: 'Googlebot-News',
        allow: '/',
      },
      // Bingbot: Full access
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      // GPTBot (OpenAI): Allow for AI visibility
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      // Google-Extended (Bard/Gemini training): Allow
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      // CCBot (Common Crawl): Disallow training scraping
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      // Bytespider (TikTok): Disallow aggressive scraping
      {
        userAgent: 'Bytespider',
        disallow: '/',
      },
      // ClaudeBot (Anthropic): Allow for AI visibility
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      // PerplexityBot: Allow for AI search visibility
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/sitemap-news.xml`
    ],
    host: siteUrl,
  }
}
