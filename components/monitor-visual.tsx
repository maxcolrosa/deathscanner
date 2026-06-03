"use client";

import { motion, useReducedMotion } from "motion/react";

// A looping ECG trace plus a static "index" readout. The motion communicates
// "live instrument"; it collapses to a static trace under reduced motion.
export function MonitorVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="rounded-lg border border-monitor-line bg-monitor-panel p-6">
      <div className="flex items-center justify-between font-mono text-xs text-monitor-muted">
        <span>AI MODEL v4.2</span>
        <span className="text-monitor-accent">active</span>
      </div>

      <svg
        viewBox="0 0 320 90"
        className="mt-4 w-full"
        role="img"
        aria-label="A stylized heart-rate trace"
      >
        <motion.path
          d="M0 45 H70 L80 45 L88 20 L96 70 L104 45 H150 L160 45 L168 30 L176 60 L184 45 H320"
          fill="none"
          stroke="var(--color-monitor-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0.4 }}
          animate={reduce ? undefined : { pathLength: 1, opacity: 1 }}
          transition={
            reduce
              ? undefined
              : { duration: 2.2, repeat: Infinity, ease: "linear" }
          }
        />
      </svg>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="font-mono text-5xl tracking-tighter text-monitor-fg">
            82.4
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            longevity index
          </div>
        </div>
        <div className="font-mono text-xs text-monitor-muted">
          calibrating...
        </div>
      </div>
    </div>
  );
}
