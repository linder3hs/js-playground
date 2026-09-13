import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["js-playground-alpha.vercel.app"],
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // El playground web se retiró; la URL quedó publicada y en el sitemap.
  async redirects() {
    return [
      {
        source: "/playground/web",
        destination: "/playground/js-ts",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
