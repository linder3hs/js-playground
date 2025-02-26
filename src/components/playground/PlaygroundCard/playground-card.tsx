"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { useState, ReactNode } from "react";

// Define interface for PlaygroundCard props
interface PlaygroundCardProps {
  title: string;
  icon: ReactNode;
  description: string;
  gradient: string;
  link: string;
  tags?: string[];
  comingSoon?: boolean;
}

// PlaygroundCard component with animations and hover effects
export function PlaygroundCard({
  title,
  icon,
  description,
  gradient,
  link,
  tags = [],
  comingSoon = false,
}: PlaygroundCardProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Contenido de la tarjeta común para ambos estados
  const cardContent = (
    <>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 dark:opacity-30 z-0`}
      ></div>

      {/* Card Content */}
      <div
        className={`relative z-10 p-6 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-all duration-300 border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col ${
          comingSoon ? "opacity-90" : ""
        }`}
      >
        {/* Coming Soon Badge */}
        {comingSoon && (
          <div className="absolute right-4 top-4 bg-gray-800/60 dark:bg-gray-700/70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            <span>Coming Soon</span>
          </div>
        )}

        <div className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 inline-flex items-center justify-center w-14 h-14 mb-4 shadow-sm">
          {icon}
        </div>

        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
          {title}
          {!comingSoon && (
            <motion.span
              animate={isHovered ? { x: 4, opacity: 1 } : { x: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpRight className="w-4 h-4 text-orange-500" />
            </motion.span>
          )}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Hover Animation - solo para elementos clickeables */}
        {!comingSoon && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: "left" }}
          />
        )}
      </div>
    </>
  );

  // Renderizado condicional basado en si es "Coming Soon" o no
  if (comingSoon) {
    return (
      <motion.div
        className="relative group block rounded-xl overflow-hidden cursor-default"
        initial={{ opacity: 0.95 }}
        whileHover={{
          opacity: 1,
          y: -3,
          transition: { duration: 0.2 },
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.a
      href={link}
      className="relative group block rounded-xl overflow-hidden"
      whileHover={{ y: -5 }}
      whileTap={{ y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {cardContent}
    </motion.a>
  );
}
