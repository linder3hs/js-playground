// src/app/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
} from "framer-motion";
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

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
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
