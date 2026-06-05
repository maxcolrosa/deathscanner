"use client";

import { useMemo } from "react";
import { ReportCard } from "@/components/report-card";
import { GuidePitch } from "@/components/guide-pitch";
import { ResultStickyBar } from "@/components/result-sticky-bar";
import { SaleProvider } from "@/components/sale-context";
import type { Currency } from "@/lib/product";
import { computeResult, type Answers } from "@/lib/longevity";

// The result experience (death-date reveal + plan pitch + sticky CTA), rendered
// from a set of answers. Shared by the live scan flow (app/scan/scan-flow.tsx)
// and the tokenized "see your result" link emailed at capture
// (app/result/[token]/page.tsx), so both render an identical result.
//
// SaleProvider mounts here, so the per-visitor countdown starts when the result
// lands; `currency` is threaded in so every price reads the visitor's local
// currency.
export function ResultView({
  answers,
  currency = "USD",
}: {
  answers: Answers;
  currency?: Currency;
}) {
  const result = useMemo(() => computeResult(answers), [answers]);
  return (
    <SaleProvider currency={currency}>
      <main className="pb-24">
        <ReportCard result={result} answers={answers} />
        <GuidePitch result={result} answers={answers} />
        <ResultStickyBar
          recoverableYears={result.recoverableYears}
          answers={answers}
        />
      </main>
    </SaleProvider>
  );
}
