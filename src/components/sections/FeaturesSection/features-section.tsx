// src/components/FeaturesSection.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Zap,
  Share2,
  Code2,
  Laptop,
  CloudUpload,
  KeySquare,
  Palette,
  Layers,
} from "lucide-react";

export function FeaturesSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [0.6, 1, 1, 0.6]
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Instant Execution",
      description:
        "Write and run code instantly without any setup or configuration. See results in real-time as you type.",
    },
    {
      icon: <Share2 className="w-6 h-6 text-blue-500" />,
      title: "Easy Sharing",
      description:
        "Share your code with others using a simple URL. Perfect for collaboration, teaching, and troubleshooting.",
    },
    {
      icon: <Code2 className="w-6 h-6 text-green-500" />,
      title: "Multiple Languages",
      description:
        "Support for various programming languages with syntax highlighting, autocomplete, and error checking.",
    },
    {
      icon: <Laptop className="w-6 h-6 text-purple-500" />,
      title: "Cross-Platform",
      description:
        "Access your playgrounds from any device, anywhere. Your code syncs automatically across all platforms.",
    },
    {
      icon: <CloudUpload className="w-6 h-6 text-cyan-500" />,
      title: "Automatic Saving",
      description:
        "Never lose your work with automatic cloud saving. Pick up right where you left off every time.",
    },
    {
      icon: <KeySquare className="w-6 h-6 text-red-500" />,
      title: "Keyboard Shortcuts",
      description:
        "Boost your productivity with intuitive keyboard shortcuts for all common operations.",
    },
    {
      icon: <Palette className="w-6 h-6 text-pink-500" />,
      title: "Customizable Themes",
      description:
        "Choose from light, dark, and custom editor themes to reduce eye strain and code in comfort.",
    },
    {
      icon: <Layers className="w-6 h-6 text-amber-500" />,
      title: "Multiple Files",
      description:
        "Work with multiple files in a single project. Perfect for more complex developments and experiments.",
    },
  ];

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-[#0E1525] dark:to-[#1C2333] -z-10"></div>

      {/* Animated background elements */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl -z-10"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]), opacity }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -z-10"
      />

      <div className="container mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 mb-4">
            Powerful Features
          </span>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Everything You Need to Code Better
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Our playground combines powerful features with an intuitive
            interface to provide the best coding experience
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative p-6 bg-white dark:bg-[#1C2333] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm hover:shadow-md transition-all group"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 inline-flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                <div className="absolute transform rotate-45 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold py-1 right-[-35px] top-[16px] w-[170%]"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
