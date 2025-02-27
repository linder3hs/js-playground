import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["js-playground-alpha.vercel.app"],
    formats: ["image/avif", "image/webp"],
  },
  // Compression and performance optimization
  compress: true,
};

export default nextConfig;
