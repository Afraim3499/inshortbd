/**
 * New article email template
 * Sent automatically when a new article is published
 */

import { getSiteUrl } from '@/lib/env'
import { getUnsubscribeUrl } from '@/lib/email/resend'

interface NewArticleEmailProps {
  post: {
    title: string
    excerpt: string | null
    slug: string
    category: string
    featured_image_url: string | null
    author_name?: string
    published_at: string
  }
  unsubscribeToken: string
}

export function getNewArticleEmailHtml({ post, unsubscribeToken }: NewArticleEmailProps): string {
  const siteUrl = getSiteUrl()
  const articleUrl = `${siteUrl}/news/${post.slug}`
  const unsubscribeUrl = getUnsubscribeUrl(unsubscribeToken)
  const imageUrl = post.featured_image_url || `${siteUrl}/og-image.png`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} | Inshort</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #09090b; color: #fafafa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #09090b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #18181b; border: 1px solid #27272a;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center; border-bottom: 1px solid #27272a;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #fafafa; letter-spacing: -0.5px;">Inshort</h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: #a1a1aa; font-family: 'JetBrains Mono', monospace;">Follow the path to the truth.</p>
            </td>
          </tr>
          
          <!-- Article Content -->
          <tr>
            <td style="padding: 0;">
              ${post.featured_image_url ? `
              <img src="${imageUrl}" alt="${post.title}" style="width: 100%; height: auto; display: block; border: none;" />
              ` : ''}
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px 40px;">
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; padding: 4px 12px; background-color: #27272a; color: #3b82f6; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px;">
                  ${post.category}
                </span>
              </div>
              
              <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: bold; line-height: 1.2; color: #fafafa;">
                ${post.title}
              </h2>
              
              ${post.excerpt ? `
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                ${post.excerpt}
              </p>
              ` : ''}
              
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${articleUrl}" style="display: inline-block; padding: 14px 36px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Read Full Article</a>
                  </td>
                </tr>
              </table>
              
              ${post.author_name ? `
              <p style="margin: 20px 0 0; font-size: 14px; color: #71717a;">
                By ${post.author_name}
              </p>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #71717a;">
                Inshort - Follow the path to the truth.
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                <a href="${siteUrl}" style="color: #3b82f6; text-decoration: none;">Visit Website</a> | 
                <a href="${unsubscribeUrl}" style="color: #71717a; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

