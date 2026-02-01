'use client'

import Script from 'next/script'

export function GoogleNewsScript() {
  return (
    <>
      <Script
        src="https://news.google.com/swg/js/v1/swg-basic.js"
        strategy="afterInteractive"
      />
      <Script id="swg-init" strategy="afterInteractive">
        {`
          (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
            // Disable in development (localhost or local network)
            const isDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          window.location.hostname.startsWith('192.168.');
            if (isDev) {
                return;
            }
            basicSubscriptions.init({
              type: "NewsArticle",
              isPartOfType: ["Product"],
              isPartOfProductId: "CAownPbDDA:openaccess",
              clientOptions: { theme: "light", lang: "en" },
            });
          });
        `}
      </Script>
    </>
  )
}
