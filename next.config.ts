import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable image optimization
  images: {
    domains: ["js-playground-alpha.vercel.app"],
    formats: ["image/avif", "image/webp"],
  },

  // Compression and performance optimization
  compress: true,

  // Internationalization for future expansion
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
  },

  // Custom headers for security and caching
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          // Content Security Policy to enhance security
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://*.vercel.app; font-src 'self' data:; connect-src 'self' https://*.vercel.app; frame-src 'self'; object-src 'none'",
          },
        ],
      },
      {
        // Cache static assets for longer periods
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirect old URLs to new ones (example)
  async redirects() {
    return [
      {
        source: "/javascript-playground",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
