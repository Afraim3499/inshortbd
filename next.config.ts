import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // experimental: { 
  //   optimizePackageImports: [...] 
  // } - Removed to fix Turbopack crash
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'dzheyadrgfzvprbblvuo.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  productionBrowserSourceMaps: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Quantum: HTTP/3 Advertisement
          {
            key: 'Alt-Svc',
            value: 'h3=":443"; ma=86400',
          },
          // Client Hints for Adaptive Loading
          {
            key: 'Accept-CH',
            value: 'Sec-CH-UA-Model, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, DPR, Viewport-Width, Width',
          },
          // HTTP/2 Optimization: Vary header for better caching
          {
            key: 'Vary',
            value: 'Accept-Encoding, User-Agent',
          },
          // Resource Hints for HTTP/2
          {
            key: 'Link',
            value: '<https://fonts.googleapis.com>; rel=preconnect; crossorigin, <https://fonts.gstatic.com>; rel=preconnect; crossorigin',
          },
        ],
      },
      {
        source: '/:path*.map',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, no-cache, must-revalidate',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          }
        ],
      },
    ]
  },
};

export default nextConfig;
