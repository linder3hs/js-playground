"use client";

import { motion } from "framer-motion";
import { Terminal, Command, Code2, Laptop, Braces, FileJson } from "lucide-react";
import { ReactNode } from "react";
import { PlaygroundCard } from "../PlaygroundCard";

// Define interface for playground data
interface PlaygroundData {
  title: string;
  icon: ReactNode;
  description: string;
  gradient: string;
  link: string;
  tags: string[];
  comingSoon?: boolean;
}

export function PlaygroundGrid() {
  // Enhanced playground cards with tags
  const playgrounds: PlaygroundData[] = [
    {
      title: "JavaScript",
      icon: <Terminal className="w-6 h-6 text-yellow-500" />,
      description:
        "Modern JavaScript development environment with full ES6+ support and real-time execution.",
      gradient: "from-yellow-500/20 to-orange-500/20",
      link: "/playground/js-ts",
      tags: ["ES6+", "Console", "Auto-save"],
    },
    {
      title: "TypeScript",
      icon: <Command className="w-6 h-6 text-blue-500" />,
      description:
        "TypeScript playground with full type checking, IntelliSense, and error diagnostics.",
      gradient: "from-blue-500/20 to-purple-500/20",
      link: "/playground/js-ts",
      tags: ["Type-safe", "Intellisense", "Compiler"],
    },
    {
      title: "Web Editor",
      icon: <Code2 className="w-6 h-6 text-purple-500" />,
      description:
        "Live HTML, CSS, and JavaScript editor with real-time preview and responsive testing.",
      gradient: "from-purple-500/20 to-pink-500/20",
      link: "/playground/web",
      tags: ["HTML", "CSS", "Live Preview"],
    },
    {
      title: "Markdown Editor",
      icon: <Code2 className="w-6 h-6 text-green-500" />,
      description:
        "Write and preview Markdown documents with live rendering and syntax highlighting.",
      gradient: "from-purple-500/20 to-pink-500/20",
      link: "/playground/markdown",
      tags: ["Markdown", "Syntax", "Preview"],
    },
    {
      title: "JSON Formatter",
      icon: <FileJson className="w-6 h-6 text-amber-500" />,
      description:
        "Format, validate and visualize JSON data with a tree view for easy exploration.",
      gradient: "from-amber-500/20 to-orange-500/20",
      link: "/playground/json",
      tags: ["Formatter", "Validator", "Tree View"],
    },
    {
      title: "React Editor",
      icon: <Braces className="w-6 h-6 text-cyan-500" />,
      description:
        "Build and test React components with JSX syntax support and live component preview.",
      gradient: "from-cyan-500/20 to-blue-400/20",
      link: "/playground/react",
      tags: ["JSX", "Components", "Hooks"],
      comingSoon: true,
    },
    {
      title: "Swift Playground",
      icon: <Laptop className="w-6 h-6 text-orange-500" />,
      description:
        "Write and experiment with Swift code for iOS and macOS development.",
      gradient: "from-orange-500/20 to-red-500/20",
      link: "/playground/swift",
      tags: ["iOS", "macOS", "Swift"],
      comingSoon: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-12">
      <div className="flex flex-col items-center justify-center mb-12">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Choose Your Playground
        </motion.h2>
        <motion.p
          className="text-gray-600 dark:text-gray-300 text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Select from our specialized development environments tailored for
          various languages and frameworks
        </motion.p>
      </div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {playgrounds.map((playground, index) => (
          <motion.div key={index} variants={cardVariants}>
            <PlaygroundCard {...playground} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
