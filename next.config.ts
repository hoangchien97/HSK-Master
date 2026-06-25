import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ukbeoggejnqgdxqoqkvj.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'alfbzgjpjvrcfaxxvijl.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thanhmaihsk.edu.vn',
        port: '',
        pathname: '/**',
      },
    ],
    qualities: [75, 85],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Acknowledge Turbopack for dev; PWA webpack plugin only runs in production builds
  turbopack: {},
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'embla-carousel-react',
      'react-toastify',
      'date-fns',
      'zod',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  workboxOptions: {
    // Portal pages must never be served from SW cache
    navigateFallbackDenylist: [/^\/portal/],
    exclude: [/\/portal\//],
    runtimeCaching: [
      {
        // Landing shell pages — stale-while-revalidate, 10 min TTL
        urlPattern: /^https:\/\/[^/]+\/(|about|contact|courses|privacy|terms)(\?.*)?$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "landing-pages",
          expiration: { maxEntries: 20, maxAgeSeconds: 600 },
        },
      },
      {
        // Course detail pages — stale-while-revalidate, 10 min TTL
        urlPattern: /^https:\/\/[^/]+\/courses\/.+$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "course-detail-pages",
          expiration: { maxEntries: 50, maxAgeSeconds: 600 },
        },
      },
    ],
  },
})(nextConfig);
