import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers"
import Script from "next/script";

export const metadata: Metadata = {
  title: "JS Playground - Interactive JavaScript & TypeScript Code Editor",
  description:
    "Free online JavaScript and TypeScript playground with real-time code execution, Monaco editor, and advanced features for beginners and professionals. Try, test, and share your code instantly.",
  keywords:
    "JS Playground, JavaScript playground, TypeScript playground, online code editor, web playground, JavaScript editor, code testing, Monaco editor, web development tools, coding practice, learn JavaScript, interactive coding",
  authors: [{ name: "JS Playground Contributors" }],
  openGraph: {
    title: "JS Playground - Interactive JavaScript & TypeScript Code Editor",
    description:
      "Free online JavaScript and TypeScript playground with real-time code execution, Monaco editor, and advanced features for beginners and professionals.",
    url: "https://js-playground-alpha.vercel.app/",
    siteName: "JS Playground",
    images: [
      {
        url: "https://js-playground-alpha.vercel.app/image.png",
        width: 1200,
        height: 630,
        alt: "JS Playground Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JS Playground - Interactive JavaScript & TypeScript Code Editor",
    description:
      "Free online JavaScript and TypeScript playground with real-time code execution, Monaco editor, and advanced features for beginners and professionals.",
    images: ["https://js-playground-alpha.vercel.app/image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://js-playground-alpha.vercel.app/",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JS Playground",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A modern, feature-rich JavaScript playground built with Next.js and Monaco Editor for testing, learning, and experimenting with JavaScript code.",
    screenshot: "https://js-playground-alpha.vercel.app/image.png",
    softwareVersion: "1.0",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>
          JS Playground - Interactive JavaScript & TypeScript Code Editor
        </title>
        <meta
          name="description"
          content="Free online JavaScript and TypeScript playground with real-time code execution, Monaco editor, and advanced features for beginners and professionals. Try, test, and share your code instantly."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="JS Playground, JavaScript playground, TypeScript playground, online code editor, web playground, JavaScript editor, code testing, Monaco editor, web development tools, coding practice, learn JavaScript, interactive coding"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://js-playground-alpha.vercel.app/"
        />
        <meta
          property="og:title"
          content="JS Playground - Interactive JavaScript & TypeScript Code Editor"
        />
        <meta
          property="og:description"
          content="Free online JavaScript and TypeScript playground with real-time code execution, Monaco editor, and advanced features for beginners and professionals."
        />
        <meta
          property="og:image"
          content="https://js-playground-alpha.vercel.app/image.png"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://js-playground-alpha.vercel.app/"
        />
        <meta
          property="twitter:title"
          content="JS Playground - Interactive JavaScript & TypeScript Code Editor"
        />
        <meta
          property="twitter:description"
          content="Free online JavaScript and TypeScript playground with real-time code execution, Monaco editor, and advanced features for beginners and professionals."
        />
        <meta
          property="twitter:image"
          content="https://js-playground-alpha.vercel.app/image.png"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://js-playground-alpha.vercel.app/" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

       
      </head>
      <body>
        <Providers>{children}</Providers>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
