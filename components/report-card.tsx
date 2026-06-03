"use client";

import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import { SaleCountdown } from "@/components/sale-countdown";
import { PRODUCT } from "@/lib/product";
import type { RiskFactor, ScanResult } from "@/lib/longevity";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const IMPACT_LABEL: Record<RiskFactor["impact"], string> = {
  high: "High impact",
  moderate: "Moderate impact",
  minor: "Minor impact",
};

function buildNarrative(result: ScanResult): string {
  const [worst, second] = result.topRisks;
  const strength = result.strengths[0];
  if (!worst) {
    return "Your modifiable risks are already low. Your daily habits are doing most of the work in your favor, which is rare.";
  }
  const drivers = second
    ? `${worst.category.toLowerCase()} and ${second.category.toLowerCase()}`
    : worst.category.toLowerCase();
  const tail = strength
    ? ` Your ${strength.category.toLowerCase()} is the main thing pulling the other way.`
    : "";
  return `Most of the gap between you and the average comes down to two things: ${drivers}. The rest of your profile is closer to baseline.${tail}`;
}

export function ReportCard({
  result,
  onSeePlan,
}: {
  result: ScanResult;
  onSeePlan: () => void;
}) {
  const deathLabel = dateFormatter.format(result.predictedDeathDate);
  const years = result.recoverableYears.toFixed(0);

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-8 px-6 pt-20 pb-10">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-alert">
          AI analysis complete
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          Your estimated lifespan
        </h2>
      </div>

      <div className="rounded-lg border border-monitor-alert/40 bg-monitor-panel p-8">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          Estimated date of death
        </div>
        <div className="mt-2 font-mono text-5xl tracking-tighter text-monitor-alert md:text-6xl">
          {deathLabel}
        </div>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-sm text-monitor-fg">
          <span>
            Around{" "}
            <CountUp to={result.ageAtDeath} className="text-monitor-alert" /> years
            old
          </span>
          <span className="text-monitor-muted">You are {result.currentAge} now</span>
          <span className="text-monitor-muted">Model confidence 94%</span>
        </div>
      </div>

      {/* Conversion hook kept above the fold: the offer is visible without scrolling. */}
      <div className="rounded-lg border border-monitor-accent/40 bg-monitor-panel p-6">
        {result.recoverableYears > 0 ? (
          <p className="text-lg leading-relaxed text-monitor-fg">
            That date is not fixed. The model estimates that reversing your top
            risks could move it back by roughly{" "}
            <span className="font-mono text-monitor-accent">{years} years</span>.
            Here is the plan that goes after them.
          </p>
        ) : (
          <p className="text-lg leading-relaxed text-monitor-fg">
            Your risks are already low. Here is the plan to push you toward the top
            of your range and hold it there.
          </p>
        )}
        <Button
          onClick={onSeePlan}
          className="mt-4 bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
        >
          {result.recoverableYears > 0
            ? `Show me how to reclaim ${years} years`
            : "Show me my plan"}
        </Button>
        <p className="mt-3 font-mono text-xs leading-relaxed text-monitor-muted">
          Your full personalized plan is normally{" "}
          <span className="line-through">${PRODUCT.listPrice}</span>.{" "}
          <span className="text-monitor-fg">${PRODUCT.price} today</span>, locked in
          for the next <SaleCountdown className="text-monitor-accent" />.
        </p>
      </div>

      <p className="max-w-[60ch] text-base leading-relaxed text-monitor-fg">
        {buildNarrative(result)}
      </p>

      {result.topRisks.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            What is shortening your life
          </h3>
          <div className="flex flex-col gap-3">
            {result.topRisks.map((risk) => (
              <div
                key={risk.id}
                className="rounded-lg border border-monitor-line bg-monitor-panel p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-monitor-fg">
                    {risk.category}
                  </span>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-monitor-alert">
                    {IMPACT_LABEL[risk.impact]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-monitor-muted">{risk.answerLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-monitor-muted">
                  {risk.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result.strengths.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            Working in your favor
          </h3>
          <ul className="flex flex-col divide-y divide-monitor-line">
            {result.strengths.map((s) => (
              <li key={s.id} className="flex flex-col gap-1 py-3">
                <span className="text-sm font-semibold text-monitor-accent">
                  {s.category}
                </span>
                <span className="text-sm leading-relaxed text-monitor-muted">
                  {s.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
