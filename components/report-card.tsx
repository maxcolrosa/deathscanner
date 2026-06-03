"use client";

import { motion } from "motion/react";
import { CountUp } from "@/components/count-up";
import { SaleCountdown } from "@/components/sale-countdown";
import { useSale } from "@/components/sale-context";
import { CheckoutButton } from "@/components/checkout-button";
import type { Answers, RiskFactor, ScanResult } from "@/lib/longevity";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

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

export function ReportCard({ result, answers }: { result: ScanResult; answers: Answers }) {
  const { price, listPrice, expired } = useSale();
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
            Around <CountUp to={result.ageAtDeath} className="text-monitor-alert" /> years old
          </span>
          <span className="text-monitor-muted">You are {result.currentAge} now</span>
          <span className="text-monitor-muted">Model confidence {result.modelConfidence}%</span>
        </div>
      </div>

      {/* Above-the-fold offer block */}
      <div className="rounded-lg border border-monitor-accent/40 bg-monitor-panel shadow-[inset_0_1px_0_rgba(46,230,201,0.07)]">
        {/* Status bar */}
        <div className="flex items-center gap-2.5 border-b border-monitor-accent/20 px-6 py-2.5">
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="block h-1.5 w-1.5 rounded-full bg-monitor-accent"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-monitor-accent">
            {expired ? "Price updated" : "Price locked"}
          </span>
          <span className="ml-auto font-mono text-[10px] text-monitor-muted">
            {expired ? (
              "Offer closed"
            ) : (
              <>
                Expires in <SaleCountdown className="text-monitor-accent" />
              </>
            )}
          </span>
        </div>

        {/* Body: narrative left, price right on md+ */}
        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_auto]">
          {/* Narrative */}
          <div className="flex flex-col justify-center gap-3 px-6 py-6 md:border-r md:border-monitor-accent/20">
            {result.recoverableYears > 0 ? (
              <p className="text-base leading-relaxed text-monitor-fg">
                That date is not fixed. Reversing your top risks could move it back by roughly{" "}
                <span className="font-mono text-monitor-accent">{years} years</span>. Your
                personalized protocol goes after them, in order.
              </p>
            ) : (
              <p className="text-base leading-relaxed text-monitor-fg">
                Your risks are already low. Your personalized protocol pushes you toward the top of
                your range and holds it there.
              </p>
            )}
            <div className="hidden md:block">
              <CheckoutButton
                label={
                  result.recoverableYears > 0
                    ? `Build my plan and reclaim ${years} years`
                    : "Build my plan"
                }
                answers={answers}
              />
            </div>
          </div>

          {/* Price column */}
          <div className="flex flex-col items-start gap-1 border-t border-monitor-accent/20 px-6 py-6 md:min-w-[11rem] md:items-end md:border-t-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-monitor-muted">
              Today only
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-semibold tracking-tighter text-monitor-fg">
                ${price}
              </span>
              <span className="font-mono text-sm text-monitor-muted line-through">${listPrice}</span>
            </div>
            <span className="font-mono text-[10px] text-monitor-muted">one time</span>
          </div>
        </div>

        {/* CTA row on mobile only */}
        <div className="border-t border-monitor-accent/20 px-6 py-4 md:hidden">
          <CheckoutButton
            label={
              result.recoverableYears > 0
                ? `Build my plan and reclaim ${years} years`
                : "Build my plan"
            }
            answers={answers}
          />
        </div>
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
              <div key={risk.id} className="rounded-lg border border-monitor-line bg-monitor-panel p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-monitor-fg">{risk.category}</span>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-monitor-alert">
                    {IMPACT_LABEL[risk.impact]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-monitor-muted">{risk.answerLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-monitor-muted">{risk.detail}</p>
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
                <span className="text-sm font-semibold text-monitor-accent">{s.category}</span>
                <span className="text-sm leading-relaxed text-monitor-muted">{s.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
