/**
 * Campaign email template
 * For custom newsletter campaigns
 */

import { getSiteUrl } from '@/lib/env'
import { getUnsubscribeUrl } from '@/lib/email/resend'

interface CampaignEmailProps {
  subject: string
  content: string
  unsubscribeToken: string
}

export function getCampaignEmailHtml({ subject, content, unsubscribeToken }: CampaignEmailProps): string {
  const siteUrl = getSiteUrl()
  const unsubscribeUrl = getUnsubscribeUrl(unsubscribeToken)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject} | Inshort</title>
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
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <div style="font-size: 16px; line-height: 1.6; color: #fafafa;">
                ${content}
              </div>
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






