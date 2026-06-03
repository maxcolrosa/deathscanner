"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

export function CountUp({
  to,
  duration = 1.6,
  className = "",
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, duration, reduce]);

  return <span className={className}>{value}</span>;
}
