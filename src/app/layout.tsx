import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers"
import Script from "next/script";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

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
    url: "https://playground.linderhassinger.dev/",
    siteName: "JS Playground",
    images: [
      {
        url: "https://playground.linderhassinger.dev/image.png",
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
    images: ["https://playground.linderhassinger.dev/image.png"],
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
    canonical: "https://playground.linderhassinger.dev/",
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
    screenshot: "https://playground.linderhassinger.dev/image.png",
    softwareVersion: "1.0",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };


  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
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
          content="https://playground.linderhassinger.dev/"
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
          content="https://playground.linderhassinger.dev/image.png"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://playground.linderhassinger.dev/"
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
          content="https://playground.linderhassinger.dev/image.png"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://playground.linderhassinger.dev/" />

        {/* Icons come from the app directory conventions: favicon.ico,
            icon.svg and apple-icon.png. Next injects the links itself; the
            hand-written ones here pointed at files that never existed. */}
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
