// src/components/ui/custom-cursor.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if the device is mobile/tablet
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    // Track mouse position
    const mouseMove = (e: any) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    // Track hover states on links and buttons
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, select, textarea'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("resize", checkDevice);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  // Don't render the custom cursor on mobile devices
  if (isMobile) return null;

  return (
    <>
      <style jsx global>{`
        body {
          cursor: none;
        }

        a,
        button,
        [role="button"],
        input,
        select,
        textarea {
          cursor: none !important;
        }
      `}</style>

      {/* Main cursor */}
      <motion.div
        className="fixed z-50 pointer-events-none w-6 h-6 rounded-full"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          mixBlendMode: "difference",
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "#fff" : "rgba(255, 255, 255, 0.8)",
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Cursor tail */}
      <motion.div
        className="fixed z-40 pointer-events-none w-4 h-4 rounded-full bg-white/30 backdrop-blur"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
        }}
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 0.5,
        }}
        transition={{ duration: 0.3, delay: 0.05 }}
      />
    </>
  );
}
