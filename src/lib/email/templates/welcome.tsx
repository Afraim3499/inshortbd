/**
 * Welcome email template for new newsletter subscribers
 */

import { getSiteUrl } from '@/lib/env'

interface WelcomeEmailProps {
  name?: string
  unsubscribeUrl: string
}

export function getWelcomeEmailHtml({ name, unsubscribeUrl }: WelcomeEmailProps): string {
  const siteUrl = getSiteUrl()
  const greeting = name ? `Hi ${name},` : 'Hi there,'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Inshort</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #09090b; color: #fafafa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #09090b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #18181b; border: 1px solid #27272a;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #27272a;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #fafafa; letter-spacing: -0.5px;">Inshort</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #a1a1aa; font-family: 'JetBrains Mono', monospace;">Follow the path to the truth.</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #fafafa;">
                ${greeting}
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #fafafa;">
                Welcome to Inshort! You're now subscribed to receive the latest news and analysis delivered straight to your inbox.
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #fafafa;">
                We promise to deliver unbiased, fact-based journalism that helps you stay informed. No fluff, no bias—just the truth.
              </p>
              
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}" style="display: inline-block; padding: 12px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Visit Inshort</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                You'll receive our latest articles, breaking news updates, and exclusive content. If you ever want to unsubscribe, you can do so <a href="${unsubscribeUrl}" style="color: #3b82f6; text-decoration: underline;">here</a>.
              </p>
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






