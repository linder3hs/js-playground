"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Command, Github, Menu, X } from "lucide-react";
import Link from "next/link";

// Interface for navigation links
interface NavLink {
  name: string;
  href: string;
}

// Interface for mobile menu props
interface AnimateMobileMenuProps {
  isOpen: boolean;
  links: NavLink[];
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { scrollY } = useScroll();

  // Transform opacity based on scroll position
  const navbarOpacity: MotionValue<number> = useTransform(
    scrollY,
    [0, 50],
    [0.8, 1]
  );
  const navbarBlur: MotionValue<number> = useTransform(
    scrollY,
    [0, 50],
    [8, 12]
  );
  const navbarBorder: MotionValue<string> = useTransform(
    scrollY,
    [0, 50],
    ["transparent", "rgba(31, 41, 55, 0.2)"]
  );

  const logoVariants = {
    hover: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5 },
    },
  };

  const navLinks: NavLink[] = [
    { name: "JS / TS Editor", href: "/playground/js-ts" },
    { name: "Web Editor", href: "/playground/web" },
    { name: "MD Editor", href: "/playground/markdown" },
    { name: "JSON Viewer", href: "/playground/json" },
    // { name: "Docs", href: "/docs" },
  ];

  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        style={{
          opacity: navbarOpacity,
          backdropFilter: `blur(${navbarBlur}px)`,
          borderColor: navbarBorder,
        }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "dark:border-gray-800 border-gray-200 bg-white/80 dark:bg-[#0E1525]/80"
            : "border-transparent bg-white/50 dark:bg-[#0E1525]/50"
        }`}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <motion.div
                className="flex items-center gap-2"
                variants={logoVariants}
                whileHover="hover"
              >
                <Command className="w-8 h-8 text-orange-500" />
                <span className="font-semibold text-xl">Playground</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <motion.span
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {link.name}
                  </motion.span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.a
              href="https://github.com/linder3hs/js-playground"
              target="_blank"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Github className="w-5 h-5" />
            </motion.a>

            <motion.button
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all hidden md:block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Coding
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              className="p-2 text-gray-600 dark:text-gray-300 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimateMobileMenu isOpen={mobileMenuOpen} links={navLinks} />
    </>
  );
}

function AnimateMobileMenu({ isOpen, links }: AnimateMobileMenuProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-[#0E1525] border-b border-gray-200 dark:border-gray-800 md:hidden overflow-hidden"
    >
      <div className="container mx-auto px-6 py-4 flex flex-col">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {link.name}
          </Link>
        ))}
        <motion.button
          className="mt-4 w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Coding
        </motion.button>
      </div>
    </motion.div>
  );
}
