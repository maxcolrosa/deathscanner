"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { QuizStep } from "@/components/quiz-step";
import { AnalyzingSequence } from "@/components/analyzing-sequence";
import { ReportCard } from "@/components/report-card";
import { GuidePitch } from "@/components/guide-pitch";
import { QUESTIONS, computeResult, type Answers } from "@/lib/longevity";

type Phase = "quiz" | "analyzing" | "result";

export default function ScanPage() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const pitchRef = useRef<HTMLDivElement>(null);

  const question = QUESTIONS[stepIndex];

  const handleChange = useCallback(
    (value: string | number) => {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    },
    [question.id]
  );

  const handleNext = useCallback(() => {
    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setPhase("analyzing");
    }
  }, [stepIndex]);

  const handleBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    setPhase("result");
  }, []);

  const result = useMemo(
    () => (phase === "result" ? computeResult(answers) : null),
    [phase, answers]
  );

  const scrollToPitch = useCallback(() => {
    pitchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (phase === "quiz") {
    return (
      <QuizStep
        question={question}
        index={stepIndex}
        total={QUESTIONS.length}
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

  return (
    <main>
      <ReportCard result={result!} onSeePlan={scrollToPitch} />
      <div ref={pitchRef}>
        <GuidePitch result={result!} />
      </div>
    </main>
  );
}
