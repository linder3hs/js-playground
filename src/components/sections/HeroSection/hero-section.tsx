"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code, Monitor, TerminalSquare } from "lucide-react";

export function HeroSection() {

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Corregido: Cambiado el easing inválido por un preset estándar
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, delay: 0.8 },
    },
    hover: {
      scale: 1.05,
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  // Floating icons animation
  const floatingIconVariants = {
    initial: { y: 0, opacity: 0.7 },
    animate: (custom: number) => ({
      y: [0, -10, 0],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 4,
        repeat: Infinity,
        delay: custom * 0.5,
      },
    }),
  };

  return (
    <motion.div
      className="relative text-center max-w-4xl mx-auto mb-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Floating code icons */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-0 left-10 text-orange-400 opacity-30 dark:opacity-20"
          variants={floatingIconVariants}
          initial="initial"
          animate="animate"
          custom={0}
        >
          <Code size={42} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-purple-400 opacity-30 dark:opacity-20"
          variants={floatingIconVariants}
          initial="initial"
          animate="animate"
          custom={1}
        >
          <TerminalSquare size={38} />
        </motion.div>
        <motion.div
          className="absolute bottom-0 left-1/4 text-blue-400 opacity-30 dark:opacity-20"
          variants={floatingIconVariants}
          initial="initial"
          animate="animate"
          custom={2}
        >
          <Monitor size={32} />
        </motion.div>
      </div>

      <motion.div className="mb-4 inline-block" variants={itemVariants}>
        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30">
          Open Source JavaScript Playground
        </span>
      </motion.div>

      <motion.h1
        className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
        variants={itemVariants}
      >
        <span className="inline-block bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent pb-2">
          Code. Create.
        </span>
        <br />
        <span className="inline-block mt-1 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
          Share.
        </span>
      </motion.h1>

      <motion.p
        className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8"
        variants={itemVariants}
      >
        A modern playground for JavaScript development with a powerful editor
        experience. Write, test, and share code in seconds — no setup required.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
        variants={itemVariants}
      >
        <motion.a
          href="/playground/js-ts"
          className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span>Start Coding Now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-400 to-pink-400 blur-xl opacity-70 group-hover:opacity-100 transition-opacity -z-10"></span>
        </motion.a>

        <motion.a
          href="https://github.com/linder3hs/js-playground"
          target="_blank"
          className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 font-medium rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto justify-center"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span>View on GitHub</span>
        </motion.a>
      </motion.div>

      {/* Code preview snippet */}
      <motion.div
        className="mt-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl max-w-2xl mx-auto"
        variants={itemVariants}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            script.js
          </div>
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>
        <div className="p-4 text-left overflow-x-auto">
          <pre className="text-sm text-gray-800 dark:text-gray-300 font-mono">
            <code className="language-javascript">{`// Welcome to JS Playground
const greeting = "Hello, Developer!";
console.log(greeting);

// Try creating a simple function
function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(10, 25);
console.log(\`The sum is: \${result}\`);

// DOM manipulation
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  app.textContent = greeting;
});\n`}</code>
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
}
