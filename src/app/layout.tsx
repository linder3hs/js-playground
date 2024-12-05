import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Code Playground - Modern Development Environment",
  description:
    "Write, test, and share code instantly in multiple languages. A modern playground with JavaScript, TypeScript, and Swift support.",
  keywords:
    "code playground, javascript playground, typescript playground, swift playground, online IDE, web development, code editor, programming playground",
  openGraph: {
    title: "Code Playground - Modern Development Environment",
    description:
      "Write, test, and share code instantly in multiple programming languages",
    url: "https://js-playground-alpha.vercel.app",
    siteName: "Code Playground",
    images: [
      {
        url: "https://js-playground-alpha.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Code Playground Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Playground - Modern Development Environment",
    description:
      "Write, test, and share code instantly in multiple programming languages",
    creator: "@codeplayground",
    images: ["https://js-playground-alpha.vercel.app/twitter-image.png"],
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
    canonical: "https://js-playground-alpha.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
