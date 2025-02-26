"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface ScrollProgressProps {
  scrollYProgress: MotionValue<number>;
}

export function ScrollProgress({ scrollYProgress }: ScrollProgressProps) {
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500 z-50 origin-left"
      style={{ scaleX }}
    />
  );
}
