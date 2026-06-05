"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// A restrained scroll-into-view reveal. Fades + lifts a block the first time it
// enters the viewport, then leaves it alone. Collapses to a no-op under reduced
// motion. Isolated as a leaf client component so sections stay server-rendered.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
