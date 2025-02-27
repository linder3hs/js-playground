import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
};

export default nextConfig;
