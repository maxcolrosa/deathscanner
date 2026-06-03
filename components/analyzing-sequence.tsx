"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

const LOG_LINES = [
  "Initializing biometric intake...",
  "Cross-referencing actuarial tables...",
  "Analyzing metabolic markers...",
  "Estimating cellular wear...",
  "Compiling mortality projection...",
];

const LINE_INTERVAL_MS = 600;
const TAIL_MS = 800;

export function AnalyzingSequence({ onComplete }: { onComplete: () => void }) {
  const reduce = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduce) {
      onComplete();
      return;
    }

    const timers = LOG_LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), LINE_INTERVAL_MS * (i + 1))
    );

    const durationS = (LINE_INTERVAL_MS * LOG_LINES.length + TAIL_MS) / 1000;
    const controls = animate(0, 100, {
      duration: durationS,
      ease: "linear",
      onUpdate: (v) => setProgress(v),
      onComplete: () => onComplete(),
    });

    return () => {
      timers.forEach(clearTimeout);
      controls.stop();
    };
  }, [reduce, onComplete]);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
          Analyzing
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          Running your longevity scan
        </h2>
      </div>

      <div className="rounded-lg border border-monitor-line bg-monitor-panel p-6 font-mono text-sm">
        <ul className="flex flex-col gap-2">
          {LOG_LINES.slice(0, visibleLines).map((line) => (
            <li key={line} className="text-monitor-fg">
              <span className="text-monitor-accent">{">"} </span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-1 w-full overflow-hidden rounded-full bg-monitor-line">
          <div
            className="h-full bg-monitor-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-xs text-monitor-muted">
          {Math.round(progress)}% complete
        </span>
      </div>
    </div>
  );
}
