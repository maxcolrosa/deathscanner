"use client";

import { useMemo, useRef, useState } from "react";
import { QuizStep } from "@/components/quiz-step";
import { AnalyzingSequence } from "@/components/analyzing-sequence";
import { ReportCard } from "@/components/report-card";
import { GuidePitch } from "@/components/guide-pitch";
import {
  QUESTIONS,
  getActiveQuestions,
  computeResult,
  type Answers,
} from "@/lib/longevity";

type Phase = "quiz" | "analyzing" | "result";

export default function ScanPage() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentId, setCurrentId] = useState(QUESTIONS[0].id);
  const [answers, setAnswers] = useState<Answers>({});
  const pitchRef = useRef<HTMLDivElement>(null);

  // The visible question list adapts to answers (branching follow-ups appear
  // and disappear as the user answers their triggers).
  const active = useMemo(() => getActiveQuestions(answers), [answers]);
  const pos = Math.max(
    0,
    active.findIndex((q) => q.id === currentId)
  );
  const question = active[pos] ?? active[0];

  const handleChange = (value: string | number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    const idx = active.findIndex((q) => q.id === currentId);
    if (idx < active.length - 1) {
      setCurrentId(active[idx + 1].id);
    } else {
      setPhase("analyzing");
    }
  };

  const handleBack = () => {
    const idx = active.findIndex((q) => q.id === currentId);
    if (idx > 0) setCurrentId(active[idx - 1].id);
  };

  const handleAnalysisComplete = () => setPhase("result");

  const result = useMemo(
    () => (phase === "result" ? computeResult(answers) : null),
    [phase, answers]
  );

  const scrollToPitch = () => {
    pitchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (phase === "quiz") {
    return (
      <QuizStep
        question={question}
        index={pos}
        total={active.length}
        value={answers[question.id]}
        onChange={handleChange}
        onNext={handleNext}
        onBack={handleBack}
      />
    );
  }

  if (phase === "analyzing") {
    return <AnalyzingSequence onComplete={handleAnalysisComplete} />;
  }

  const recoverable = result!.recoverableYears;

  return (
    <main className="pb-24">
      <ReportCard result={result!} onSeePlan={scrollToPitch} />
      <div ref={pitchRef}>
        <GuidePitch result={result!} />
      </div>

      {/* Persistent conversion bar so the offer is always one tap away. */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-monitor-line bg-monitor-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 py-3 sm:flex-row sm:justify-between">
          <span className="text-sm text-monitor-fg">
            {recoverable > 0 ? (
              <>
                <span className="font-mono text-monitor-accent">
                  {recoverable.toFixed(0)} years
                </span>{" "}
                are still on the table.
              </>
            ) : (
              <>Lock in the years you have.</>
            )}
          </span>
          <button
            onClick={scrollToPitch}
            className="w-full rounded-md bg-monitor-accent px-6 py-2.5 text-sm font-semibold text-monitor-bg transition-colors hover:bg-monitor-accent/90 sm:w-auto"
          >
            Get my plan
          </button>
        </div>
      </div>
    </main>
  );
}
