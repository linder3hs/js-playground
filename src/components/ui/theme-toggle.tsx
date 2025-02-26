// src/components/ui/theme-toggle.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // After mounting, we can safely access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      className="p-3 rounded-full bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-gray-800 shadow-lg"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.5 }}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-blue-600" />
        )}
      </motion.div>
    </motion.button>
  );
}
