<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Inshort RSS Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; max-width: 960px; margin: 0 auto; padding: 40px; color: #333; background: #f9fafb; }
          .header { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 40px; text-align: center; }
          h1 { margin: 0 0 10px; color: #111827; }
          p { margin: 0; color: #6b7280; font-size: 16px; }
          .item { background: #fff; padding: 24px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #e5e7eb; transition: box-shadow 0.2s; }
          .item:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          h3 { margin: 0 0 10px; }
          h3 a { color: #2563EB; text-decoration: none; font-size: 20px; }
          h3 a:hover { text-decoration: underline; }
          .meta { font-size: 13px; color: #9ca3af; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
          .desc { color: #4b5563; line-height: 1.6; }
          .banner { background: #eff6ff; color: #1e40af; padding: 12px; text-align: center; border-radius: 8px; margin-bottom: 24px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="banner">
           This is an RSS feed. Subscribe by copying the URL into your news reader.
        </div>
        <div class="header">
          <h1>
            <xsl:value-of select="/rss/channel/title"/>
          </h1>
          <p>
            <xsl:value-of select="/rss/channel/description"/>
          </p>
          <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
            Last updated: <xsl:value-of select="/rss/channel/lastBuildDate"/>
          </p>
        </div>
        <xsl:for-each select="/rss/channel/item">
          <div class="item">
            <h3>
              <a href="{link}" target="_blank">
                <xsl:value-of select="title"/>
              </a>
            </h3>
            <div class="meta">
              Published: <xsl:value-of select="pubDate"/>
            </div>
            <div class="desc">
              <xsl:value-of select="description" disable-output-escaping="yes"/>
            </div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
