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
