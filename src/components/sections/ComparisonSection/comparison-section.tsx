"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useState } from "react";

// Define interface for feature
interface Feature {
  name: string;
  value: string;
  status: boolean;
}

// Define interface for comparison item
interface ComparisonItem {
  title: string;
  features: Feature[];
  highlighted: boolean;
  color: string;
}

export function ComparisonSection() {
  // Fix the type to be number | null
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const comparisonData: ComparisonItem[] = [
    {
      title: "Traditional IDEs",
      features: [
        { name: "Setup Time", value: "Hours", status: false },
        { name: "Accessibility", value: "System-specific", status: false },
        { name: "Resource Usage", value: "Heavy", status: false },
        { name: "Configuration", value: "Complex", status: false },
        { name: "Updates", value: "Manual", status: false },
        { name: "Learning Curve", value: "Steep", status: false },
        { name: "Collaboration", value: "Limited", status: false },
        { name: "Price", value: "Often expensive", status: false },
      ],
      highlighted: false,
      color: "gray",
    },
    {
      title: "JS Playground",
      features: [
        { name: "Setup Time", value: "Instant", status: true },
        { name: "Accessibility", value: "Any browser", status: true },
        { name: "Resource Usage", value: "Lightweight", status: true },
        { name: "Configuration", value: "Zero config", status: true },
        { name: "Updates", value: "Automatic", status: true },
        { name: "Learning Curve", value: "Minimal", status: true },
        { name: "Collaboration", value: "Built-in sharing", status: true },
        { name: "Price", value: "Free & Open Source", status: true },
      ],
      highlighted: true,
      color: "orange",
    },
    {
      title: "Other Online Editors",
      features: [
        { name: "Setup Time", value: "Quick", status: true },
        { name: "Accessibility", value: "Any browser", status: true },
        { name: "Resource Usage", value: "Moderate", status: true },
        { name: "Configuration", value: "Limited", status: false },
        { name: "Updates", value: "Variable", status: true },
        { name: "Learning Curve", value: "Moderate", status: false },
        { name: "Collaboration", value: "Basic", status: false },
        { name: "Price", value: "Often freemium", status: false },
      ],
      highlighted: false,
      color: "blue",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-[#1C2333] dark:to-[#0E1525]">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 mb-4">
            Why Choose Us
          </span>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            The Best Choice for Developers
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            See how our playground compares to traditional development
            environments and other online code editors
          </p>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {comparisonData.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                hoveredCard === index ? "scale-105 z-10" : "scale-100 z-0"
              } ${
                plan.highlighted
                  ? "bg-gradient-to-b from-orange-500/5 via-transparent to-purple-500/5 dark:from-orange-500/10 dark:via-transparent dark:to-purple-500/10 border-2 border-orange-500/30 dark:border-orange-500/20 shadow-xl"
                  : "bg-white dark:bg-[#1C2333] border border-gray-200 dark:border-gray-800 shadow-md"
              }`}
              variants={cardVariants}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs uppercase font-bold py-1 px-4 transform translate-x-[30%] translate-y-[30%] rotate-45">
                    Popular
                  </div>
                </div>
              )}

              {/* Card Header */}
              <div className="pt-8 pb-6 px-6">
                <h3
                  className={`text-xl font-bold mb-2 text-center ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {plan.title}
                </h3>
              </div>

              {/* Feature List */}
              <div className="px-6 pb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {feature.value}
                        </span>
                        {feature.status ? (
                          <Check className={`w-5 h-5 text-green-500`} />
                        ) : (
                          <X className={`w-5 h-5 text-red-500`} />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Highlight Feature for the JS Playground */}
                {plan.highlighted && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center">
                      <motion.div
                        className="flex flex-col items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <p className="text-center text-gray-600 dark:text-gray-300 font-medium mb-4">
                          Try it now — no account required!
                        </p>
                        <motion.button
                          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Start Coding
                        </motion.button>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
