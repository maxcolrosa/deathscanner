"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

// Staged, deliberately unhurried log so the analysis reads as real work being
// done. Mixes AI-model language with clinical/health terminology.
const STAGES: { label: string; lines: string[] }[] = [
  {
    label: "Intake",
    lines: [
      "Loading AI longevity model v4.2...",
      "Normalizing your 11 health markers...",
      "Validating biometric inputs...",
    ],
  },
  {
    label: "Risk scoring",
    lines: [
      "Scoring cardiovascular and metabolic risk...",
      "Weighting tobacco, body composition, and activity...",
      "Estimating your biological age...",
    ],
  },
  {
    label: "Simulation",
    lines: [
      "Cross-referencing 2.1M actuarial mortality records...",
      "Running 10,000 survival simulations...",
      "Separating modifiable risk from fixed risk...",
    ],
  },
  {
    label: "Projection",
    lines: [
      "Calibrating the 94% confidence interval...",
      "Compiling your longevity report...",
    ],
  },
];

const FLAT_LINES = STAGES.flatMap((s) => s.lines);
const STAGE_OF_LINE = STAGES.flatMap((s) => s.lines.map(() => s.label));

const LINE_INTERVAL_MS = 720;
const TAIL_MS = 1000;

export function AnalyzingSequence({ onComplete }: { onComplete: () => void }) {
  const reduce = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduce) {
      onComplete();
      return;
    }

    const timers = FLAT_LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), LINE_INTERVAL_MS * (i + 1))
    );

    const durationS = (LINE_INTERVAL_MS * FLAT_LINES.length + TAIL_MS) / 1000;
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

  const currentStage =
    visibleLines > 0 ? STAGE_OF_LINE[visibleLines - 1] : STAGES[0].label;
  const shown = FLAT_LINES.slice(0, visibleLines);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
          AI analysis in progress
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          Building your longevity model
        </h2>
      </div>

      <div className="min-h-[260px] rounded-lg border border-monitor-line bg-monitor-panel p-6 font-mono text-sm">
        <div className="mb-4 flex items-center justify-between text-xs text-monitor-muted">
          <span className="uppercase tracking-[0.14em] text-monitor-accent">
            {currentStage}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ul className="flex flex-col gap-2">
          {shown.map((line, i) => {
            const isLast = i === shown.length - 1;
            return (
              <li key={line} className="text-monitor-fg">
                <span className="text-monitor-accent">{">"} </span>
                {line}
                {isLast ? (
                  <span className="ml-1 inline-block animate-pulse text-monitor-accent">
                    _
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-monitor-line">
        <div
          className="h-full bg-monitor-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
