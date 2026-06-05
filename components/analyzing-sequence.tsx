"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { analysisSignals, type Answers } from "@/lib/longevity";

const PHASES = ["Intake", "Risk scoring", "Simulation", "Projection"];

const MIDDLE_POOL = [
  "Normalizing your health markers...",
  "Checking your inputs...",
  "Scoring heart and metabolic risk...",
  "Estimating your biological age...",
  "Cross-referencing 2.1M mortality records...",
  "Running 10,000 survival simulations...",
  "Splitting what you can change from what you cannot...",
  "Locking in the confidence range...",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Built fresh on each mount: the personalized lines vary by user (their answers)
// and the order is randomized, so two runs never look identical.
function buildLines(answers: Answers): string[] {
  const personalized = shuffle(analysisSignals(answers))
    .slice(0, 3)
    .map((s) => `Flagging ${s} as a contributor...`);
  const middle = shuffle(MIDDLE_POOL).slice(0, 4);
  const body = shuffle([...middle, ...personalized]);
  return [
    "Loading AI longevity model v4.2...",
    ...body,
    "Building your longevity report...",
  ];
}

const LINE_INTERVAL_MS = 720;
const TAIL_MS = 1000;

export function AnalyzingSequence({
  answers,
  onComplete,
}: {
  answers: Answers;
  onComplete: () => void;
}) {
  const reduce = useReducedMotion();
  const [lines] = useState(() => buildLines(answers));
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduce) {
      onComplete();
      return;
    }

    const timers = lines.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), LINE_INTERVAL_MS * (i + 1))
    );

    const durationS = (LINE_INTERVAL_MS * lines.length + TAIL_MS) / 1000;
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
  }, [reduce, onComplete, lines]);

  const phase = PHASES[Math.min(PHASES.length - 1, Math.floor((progress / 100) * PHASES.length))];
  const shown = lines.slice(0, visibleLines);

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

      <div className="min-h-[280px] rounded-lg border border-monitor-line bg-monitor-panel p-6 font-mono text-sm">
        <div className="mb-4 flex items-center justify-between text-xs text-monitor-muted">
          <span className="uppercase tracking-[0.14em] text-monitor-accent">
            {phase}
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
