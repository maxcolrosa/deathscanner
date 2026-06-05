"use client";

import { useMemo, useState } from "react";
import { QuizStep } from "@/components/quiz-step";
import { AnalyzingSequence } from "@/components/analyzing-sequence";
import { ReportCard } from "@/components/report-card";
import { GuidePitch } from "@/components/guide-pitch";
import { ResultStickyBar } from "@/components/result-sticky-bar";
import { SaleProvider } from "@/components/sale-context";
import type { Currency } from "@/lib/product";
import {
  QUESTIONS,
  getActiveQuestions,
  computeResult,
  type Answers,
  type AnswerValue,
} from "@/lib/longevity";

type Phase = "quiz" | "analyzing" | "result";

export function ScanFlow({ currency = "USD" }: { currency?: Currency }) {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentId, setCurrentId] = useState(QUESTIONS[0].id);
  const [answers, setAnswers] = useState<Answers>({});
  // The visible question list adapts to answers (branching follow-ups appear
  // and disappear as the user answers their triggers).
  const active = useMemo(() => getActiveQuestions(answers), [answers]);
  const pos = Math.max(
    0,
    active.findIndex((q) => q.id === currentId)
  );
  const question = active[pos] ?? active[0];

  const handleChange = (value: AnswerValue) => {
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
    return (
      <AnalyzingSequence answers={answers} onComplete={handleAnalysisComplete} />
    );
  }

  // The SaleProvider mounts here, so the countdown starts when the result lands.
  // The deadline is persisted per visitor; `currency` is resolved server-side
  // from geo and threaded in so every price reads the visitor's local currency.
  return (
    <SaleProvider currency={currency}>
      <main className="pb-24">
        <ReportCard result={result!} answers={answers} />
        <GuidePitch result={result!} answers={answers} />
        <ResultStickyBar recoverableYears={result!.recoverableYears} answers={answers} />
      </main>
    </SaleProvider>
  );
}
