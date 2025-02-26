// src/components/Footer.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Github,
  Twitter,
  Linkedin,
  Command,
  Send,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: any) => {
    e.preventDefault();
    if (email) {
      // In a real app, you would handle the subscription logic here
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  // Links data
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Playground", href: "/playground" },
        { name: "Documentation", href: "/docs" },
        { name: "API", href: "/api" },
        { name: "Updates", href: "/updates" },
      ],
    },
    {
      title: "Community",
      links: [
        {
          name: "GitHub",
          href: "https://github.com/linder3hs/js-playground",
        },
        { name: "Discord", href: "#" },
        { name: "Twitter", href: "#" },
        { name: "Contributing", href: "/contributing" },
        { name: "Code of Conduct", href: "/code-of-conduct" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "/blog" },
        { name: "Tutorials", href: "/tutorials" },
        { name: "Examples", href: "/examples" },
        { name: "Help Center", href: "/help" },
        { name: "Status", href: "/status" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Licenses", href: "/licenses" },
        { name: "Security", href: "/security" },
      ],
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <footer className="bg-[#0E1525] border-t border-gray-800 pt-16 pb-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6">
        <motion.div
          className="grid lg:grid-cols-5 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Logo and about section */}
          <motion.div
            className="col-span-1 lg:col-span-2"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-4">
              <Command className="w-8 h-8 text-orange-500" />
              <span className="font-semibold text-xl text-white">
                Playground
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              A modern JavaScript playground built for developers. Create, test,
              and share JavaScript code instantly with our powerful online
              editor.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <motion.a
                href="https://github.com/linder3hs/js-playground"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/linderhassinger/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Links sections */}
          {footerLinks.map((section, index) => (
            <motion.div key={index} variants={itemVariants}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>{link.name}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Newsletter subscription */}
        <motion.div
          className="border-t border-gray-800 pt-8 pb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Stay up to date
              </h4>
              <p className="text-gray-400">
                Subscribe to our newsletter for updates, new features, and tips.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  {isSubscribed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-10 left-0 right-0 bg-green-500 text-white text-sm py-1 px-3 rounded"
                    >
                      Thanks for subscribing!
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-r-lg flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>Subscribe</span>
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Copyright and bottom links */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="mb-4 md:mb-0">
            <p>© 2024 JS Playground. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="/cookies"
              className="hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
