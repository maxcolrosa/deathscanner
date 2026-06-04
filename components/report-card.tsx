"use client";

import { motion } from "motion/react";
import { CountUp } from "@/components/count-up";
import { SaleCountdown } from "@/components/sale-countdown";
import { useSale } from "@/components/sale-context";
import { CheckoutButton } from "@/components/checkout-button";
import type { Answers, RiskFactor, ScanResult } from "@/lib/longevity";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const IMPACT_LABEL: Record<RiskFactor["impact"], string> = {
  high: "High impact",
  moderate: "Moderate impact",
  minor: "Minor impact",
};

export function ReportCard({
  result,
  answers,
}: {
  result: ScanResult;
  answers: Answers;
}) {
  const { price, expired } = useSale();
  const deathLabel = dateFormatter.format(result.predictedDeathDate);
  const years = result.recoverableYears.toFixed(0);
  const hasYears = result.recoverableYears > 0;
  const belowAverage = result.yearsVsAverage < 0;
  const vsAverageYears = Math.abs(result.yearsVsAverage).toFixed(1);

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

      {/* ── The reveal ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-monitor-alert/40 bg-monitor-panel p-8">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          Estimated date of death
        </div>
        <div className="mt-2 font-mono text-5xl tracking-tighter text-monitor-alert md:text-6xl">
          {deathLabel}
        </div>

        {/* Population anchor */}
        <div
          className={[
            "mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-1.5",
            belowAverage
              ? "border-monitor-alert/40 bg-monitor-alert/[0.06]"
              : "border-monitor-accent/40 bg-monitor-accent/[0.06]",
          ].join(" ")}
        >
          <span
            aria-hidden
            className={[
              "block h-1.5 w-1.5 rounded-full",
              belowAverage ? "bg-monitor-alert" : "bg-monitor-accent",
            ].join(" ")}
          />
          <span className="font-mono text-xs tracking-tight text-monitor-fg">
            <span
              className={belowAverage ? "text-monitor-alert" : "text-monitor-accent"}
            >
              {vsAverageYears} years {belowAverage ? "below" : "above"}
            </span>{" "}
            the average for your age and sex
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-sm text-monitor-fg">
          <span>
            Around <CountUp to={result.ageAtDeath} className="text-monitor-alert" />{" "}
            years old
          </span>
          <span className="text-monitor-muted">You are {result.currentAge} now</span>
          <span className="text-monitor-muted">
            Model confidence {result.modelConfidence}%
          </span>
        </div>
      </div>

      {/* ── First ask: loss + price + clock + CTA ──────────────────── */}
      <div className="overflow-hidden rounded-lg border border-monitor-accent/40 bg-monitor-panel shadow-[inset_0_1px_0_rgba(46,230,201,0.07)]">
        <div className="flex items-center gap-2.5 border-b border-monitor-accent/20 px-5 py-2.5">
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="block h-1.5 w-1.5 rounded-full bg-monitor-accent"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-monitor-accent">
            {expired ? "Launch price ended" : "Launch price"}
          </span>
          <span className="ml-auto font-mono text-[10px] text-monitor-muted">
            {expired ? (
              <>now ${price}</>
            ) : (
              <>
                ends in <SaleCountdown className="text-monitor-accent" />
              </>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <p className="text-base leading-relaxed text-monitor-fg">
            {hasYears ? (
              <>
                That date is not fixed. Fixing your top risks could buy back as
                much as{" "}
                <span className="font-mono text-monitor-accent">
                  {years} years
                </span>
                . Your personalized 90-day protocol goes after them, in order,
                for ${price} today.
              </>
            ) : (
              <>
                Your risks are already low. Your personalized 90-day protocol
                pushes you toward the top of your range and holds it there, for
                ${price} today.
              </>
            )}
          </p>
          <CheckoutButton
            label={hasYears ? `Build my plan and reclaim ${years} years` : "Build my plan"}
            answers={answers}
          />
        </div>
      </div>

      {/* ── What is shortening your life ───────────────────────────── */}
      {result.topRisks.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            What is shortening your life
          </h3>
          <div className="divide-y divide-monitor-line border-y border-monitor-line">
            {result.topRisks.map((risk) => (
              <div key={risk.id} className="flex flex-col gap-1 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-monitor-fg">
                    {risk.category}
                    <span className="ml-2 font-normal text-monitor-muted">
                      {risk.answerLabel}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-monitor-alert">
                    {IMPACT_LABEL[risk.impact]}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-monitor-muted">
                  {risk.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Working in your favor ──────────────────────────────────── */}
      {result.strengths.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            Working in your favor
          </h3>
          <p className="text-sm leading-relaxed text-monitor-muted">
            {result.strengths.map((s) => s.category).join(", ")}.
          </p>
        </div>
      ) : null}
    </section>
  );
}
