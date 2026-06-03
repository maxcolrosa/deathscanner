"use client";

import { CheckoutButton } from "@/components/checkout-button";
import { SaleCountdown } from "@/components/sale-countdown";
import { useSale } from "@/components/sale-context";
import { PRODUCT, INCLUDED } from "@/lib/product";
import { Reviews } from "@/components/reviews";
import { TransformationsGallery } from "@/components/transformations-gallery";
import type { Answers, Outcome, ScanResult } from "@/lib/longevity";

// Shown on the standalone /guide page where there is no scan result.
const GENERIC_OUTCOMES: Outcome[] = [
  { id: "fat", label: "Lose stubborn body fat" },
  { id: "cardio", label: "Rebuild your cardiovascular fitness" },
  { id: "energy", label: "Stabilize your energy and sleep" },
  { id: "longevity", label: "Move your projected date in the right direction" },
];

const STEPS = [
  {
    n: "1",
    title: "Your scan found the risks",
    body: "We already know the exact factors pulling your projection down.",
  },
  {
    n: "2",
    title: "We turn them into a daily plan",
    body: "An 8-week protocol that targets your highest-impact risks first.",
  },
  {
    n: "3",
    title: "You reverse them, your date moves",
    body: "Change the inputs and the model that judged you changes its answer.",
  },
];

function formatYears(years: number): string {
  return (Math.round(years * 10) / 10).toFixed(0);
}

export function GuidePitch({
  result,
  answers,
}: {
  result?: ScanResult;
  answers?: Answers;
}) {
  const { price, listPrice, expired } = useSale();
  const recoverableYears = result?.recoverableYears ?? 0;
  const outcomes = result?.outcomes?.length ? result.outcomes : GENERIC_OUTCOMES;
  const topRisk = result?.topRisks?.[0];
  const personalized = Boolean(result);
  const hasYears = recoverableYears > 0;

  const headline = outcomes[0]?.label ?? "Add years back to your life";

  const subline = !personalized
    ? `${PRODUCT.tagline} A day-by-day plan you will actually follow.`
    : hasYears
      ? `You just saw your date. As much as ${formatYears(recoverableYears)} of those years are still on the table, plus a noticeably better quality of life, and they come from the exact habits this protocol is built to change. The date only sticks if you do nothing.`
      : "You just saw your date. This is the plan to push it later and hold it there.";

  return (
    <section className="border-t border-monitor-line px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-12">
        {/* Loss-aversion hook + results headline */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            Your personalized protocol
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-monitor-fg md:text-5xl">
            {headline}
          </h2>
          <p className="max-w-[58ch] text-lg leading-relaxed text-monitor-muted">
            {subline}
          </p>
        </div>

        {/* What they actually get out of it, derived from their answers */}
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            What 8 weeks will change for you
          </h3>
          <ul className="flex flex-col divide-y divide-monitor-line rounded-lg border border-monitor-line bg-monitor-panel">
            {outcomes.map((outcome) => (
              <li key={outcome.id} className="flex items-center gap-3 px-5 py-4">
                <span aria-hidden className="font-mono text-monitor-accent">
                  +
                </span>
                <span className="text-sm text-monitor-fg">{outcome.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Personalization: this plan is about them, not a generic course */}
        <div className="rounded-lg border border-monitor-line bg-monitor-panel p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            Built from your scan
          </h3>
          <p className="mt-3 text-base leading-relaxed text-monitor-fg">
            {personalized && topRisk
              ? `Your plan leads with ${topRisk.category.toLowerCase()}, the single biggest drag on your projection, then works down your list in order of impact. Nothing generic. Nothing you do not need.`
              : "Every plan is ordered by impact: the factors costing you the most years get fixed first. Nothing generic, nothing you do not need."}
          </p>
        </div>

        {/* Belief: why this actually moves the number */}
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            How it works
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="flex flex-col gap-2 rounded-lg border border-monitor-line bg-monitor-panel p-5"
              >
                <span className="font-mono text-2xl tracking-tighter text-monitor-accent">
                  {step.n}
                </span>
                <span className="text-sm font-semibold text-monitor-fg">
                  {step.title}
                </span>
                <span className="text-sm leading-relaxed text-monitor-muted">
                  {step.body}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Value stack */}
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            Everything you get
          </h3>
          <ul className="flex flex-col divide-y divide-monitor-line rounded-lg border border-monitor-line bg-monitor-panel">
            {INCLUDED.map((item) => (
              <li
                key={item.label}
                className="flex items-start justify-between gap-4 px-5 py-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-monitor-fg">
                    {item.label}
                  </span>
                  <span className="text-sm leading-relaxed text-monitor-muted">
                    {item.note}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-sm text-monitor-muted">
                  ${item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Social proof: real transformations and reviews, right before the offer */}
        <TransformationsGallery />
        <Reviews />

        {/* Price anchor + primary CTA */}
        <div className="flex flex-col items-center gap-5 rounded-lg border border-monitor-accent/40 bg-monitor-panel p-8 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-sm text-monitor-muted">
              Total value <span className="line-through">${PRODUCT.stackValue}</span>
            </span>
            <span className="font-mono text-sm text-monitor-muted">
              Normally <span className="line-through">${listPrice}</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
                Today
              </span>
              <span className="font-mono text-6xl tracking-tighter text-monitor-fg">
                ${price}
              </span>
            </div>
            <span className="mt-1 font-mono text-xs text-monitor-muted">
              {expired ? (
                "The launch price has ended."
              ) : (
                <>
                  This price is held for{" "}
                  <SaleCountdown className="text-monitor-accent" />
                </>
              )}
            </span>
          </div>
          <CheckoutButton answers={answers} />
        </div>

        {/* Motivating close + final CTA */}
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="max-w-[48ch] text-lg leading-relaxed text-monitor-fg">
            {hasYears
              ? `The date you saw assumes you change nothing. For less than the cost of a week of takeout, change something.`
              : `The hardest part is starting. For less than the cost of a week of takeout, start today.`}
          </p>
          <CheckoutButton
            label={`Start reclaiming your years for $${price}`}
            answers={answers}
          />
        </div>
      </div>
    </section>
  );
}
