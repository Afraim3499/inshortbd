import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";

const banglaFont = localFont({
  src: [
    { path: '../fonts/TiroBangla-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/TiroBangla-Italic.ttf', weight: '400', style: 'italic' },
  ],
  variable: '--font-bangla',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: "%s | Inshort",
    default: "Inshort",
  },
  alternates: {
    languages: {
      'bn-BD': 'https://inshortbd.com',
      'x-default': 'https://inshortbd.com',
    },
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  other: {
    'dns-prefetch': 'https://apis.google.com, https://fonts.googleapis.com, https://www.googletagmanager.com, https://analytics.google.com',
    'preconnect': 'https://fonts.gstatic.com',
    // Quantum: Protocol & Bot Hints
    'ipv6': 'true',
    // Quantum: Deep Metadata
    'DC.title': 'Inshort',
    'DC.creator': 'Inshort Team',
    'DC.language': 'bn',
    'foaf:primaryTopic': 'https://inshortbd.com/#organization',
    // Geo-Targeting (Local SEO Authority)
    'geo.region': 'BD-13',
    'geo.placename': 'Dhaka',
    'geo.position': '23.8103;90.4125',
    'ICBM': '23.8103, 90.4125',
  },
  description: "Concise. Accurate. Breaking. Global news for the modern reader.",
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/android-icon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/android-icon-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: [
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://inshortbd.com',
    siteName: 'Inshort',
    title: 'Inshort',
    description: 'Concise. Accurate. Breaking. Global news for the modern reader.',
    images: [{
      url: 'https://inshortbd.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Inshort - Independent Journalism'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@InshortBD',
    creator: '@InshortBD'
  },
  metadataBase: new URL('https://inshortbd.com'),
};

import QueryProvider from "@/providers/QueryProvider";
import { SkipToContent } from "@/components/skip-to-content";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { OrganizationStructuredData, WebSiteStructuredData, LocalBusinessStructuredData } from "@/components/structured-data";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased text-gray-900 bg-white pb-24 lg:pb-0",
          banglaFont.variable
        )}
        suppressHydrationWarning
      >
        <SkipToContent />
        <QueryProvider>
          {children}
          <MobileBottomNav />
          <OrganizationStructuredData />
          <WebSiteStructuredData />
          <LocalBusinessStructuredData />

          {/* Speculation Rules: The Secret to 0ms Latency */}
          <Script
            id="speculation-rules"
            type="speculationrules"
            dangerouslySetInnerHTML={{
              __html: `
                {
                  "prerender": [{
                    "source": "document",
                    "where": {
                      "and": [
                        { "href_matches": "/*" },
                        { "not": { "href_matches": "/api/*" } },
                        { "not": { "href_matches": "/admin/*" } },
                        { "not": { "href_matches": "/logout" } }
                      ]
                    },
                    "eagerness": "moderate"
                  }]
                }
              `
            }}
          />

          {/* Google Analytics */}
          <Script
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-2WW4JDK6Z0"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-2WW4JDK6Z0');
`,
            }}
          />

          {/* Facebook Pixel - Replace YOUR_PIXEL_ID with your actual Facebook Pixel ID */}
          {/* To activate: 1. Create Facebook Business account, 2. Get Pixel ID, 3. Replace placeholder below */}
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
// fbq('init', 'YOUR_PIXEL_ID'); // Uncomment and replace YOUR_PIXEL_ID when ready
// fbq('track', 'PageView'); // Uncomment when pixel is activated
`,
            }}
          />

          <Toaster />
          <SmoothScroll />
          <ServiceWorkerRegister />
        </QueryProvider>
      </body>
    </html>
  );
}
