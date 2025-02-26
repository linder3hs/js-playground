"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";
import Head from "next/head";
import {
  Navbar,
  HeroSection,
  PlaygroundGrid,
  FeaturesSection,
  ComparisonSection,
  FAQSection,
  Footer,
} from "@/components";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ParticleBackground } from "@/components/ui/particle-background";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Metadata } from "next";

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

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  // Animation for sections to fade in when scrolled into view
  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // JSON-LD structured data for rich results
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
    <ThemeProvider defaultTheme="dark" attribute="class">
      {/* Next.js Head component for SEO - Replace with Metadata export in Next.js 13+ */}
      <Head>
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

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#0E1525] dark:to-[#111827] text-gray-900 dark:text-white transition-colors duration-300">
        {/* Custom Cursor */}
        <CustomCursor />

        {/* Scroll Progress Indicator */}
        <ScrollProgress scrollYProgress={scrollYProgress} />

        {/* Interactive Background */}
        <ParticleBackground />

        {/* Main Content */}
        <Navbar />

        <main className="relative z-10">
          <section className="container mx-auto px-6 pt-32 pb-16">
            <HeroSection />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInVariants}
            >
              <PlaygroundGrid />
            </motion.div>
          </section>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInVariants}
          >
            <FeaturesSection />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInVariants}
          >
            <ComparisonSection />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInVariants}
          >
            <FAQSection />
          </motion.div>
        </main>

        <Footer />

        {/* Theme Toggle Button */}
        <div className="fixed bottom-5 right-5 z-50">
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  );
}
