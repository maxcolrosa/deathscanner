"use client";

import { CheckoutButton } from "@/components/checkout-button";
import { SaleCountdown } from "@/components/sale-countdown";
import { useSale } from "@/components/sale-context";
import { PRODUCT, INCLUDED, localizedValue } from "@/lib/product";
import { Reviews } from "@/components/reviews";
import { TransformationsGallery } from "@/components/transformations-gallery";
import type { Answers, Outcome, ScanResult } from "@/lib/longevity";

// Shown on the standalone /guide page where there is no scan result.
const GENERIC_OUTCOMES: Outcome[] = [
  { id: "fat", label: "Lose the stubborn body fat" },
  { id: "cardio", label: "Rebuild your heart and lung fitness" },
  { id: "energy", label: "Steady out your energy and sleep" },
  { id: "longevity", label: "Push your date in the right direction" },
];

// Objection-handling FAQ shown at the bottom of the pitch. Keeps the parody
// disclosure out (that lives in legal pages) and makes no guarantee or medical
// claim; it answers the questions that stall a purchase.
const PITCH_FAQS = [
  {
    q: "What is the AI Deepscan?",
    a: "After checkout you answer a deeper round of questions, and the AI writes a full readout of your health markers, diet, and lifestyle, matched to your plan. It is included with your purchase.",
  },
  {
    q: "Is this a subscription?",
    a: "No. You pay once. You get instant access and the whole kit is yours to keep, forever.",
  },
  {
    q: "How fast do I get it?",
    a: "Right away. The second you check out, your plan and the full download kit are ready.",
  },
  {
    q: "Do I need a gym or equipment?",
    a: "No. The plan works at home with almost nothing, and every move has an easier and a harder version.",
  },
  {
    q: "How is this different from a free plan online?",
    a: "It is built from your own scan answers and ordered by what is costing you the most years, not some generic template.",
  },
];

function formatYears(years: number): string {
  return (Math.round(years * 10) / 10).toFixed(0);
}

/* The single, dominant offer. Price anchor, live countdown, loss framing, CTA.
   Everything urgent on the page funnels here. */
function OfferModule({
  recoverableYears,
  answers,
}: {
  recoverableYears: number;
  answers?: Answers;
}) {
  const { price, expiredPrice, listPrice, expired, remaining, symbol, stackValue } =
    useSale();
  const hasTimer = remaining !== null;
  const hasYears = recoverableYears > 0;
  const savings = Math.round((1 - price / stackValue) * 100);

  return (
    <div className="overflow-hidden rounded-xl border border-monitor-accent/40 bg-monitor-panel shadow-[inset_0_1px_0_rgba(46,230,201,0.08)]">
      {/* Urgency bar */}
      <div className="flex items-center gap-2.5 border-b border-monitor-accent/20 bg-monitor-accent/[0.04] px-6 py-3">
        <span className="relative flex h-2 w-2">
          {!expired && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-monitor-accent opacity-60" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-monitor-accent" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-monitor-accent">
          {expired ? "Launch price ended" : "Launch price active"}
        </span>
        <span className="ml-auto font-mono text-[11px] text-monitor-muted">
          {expired ? (
            <>now {symbol}{price}</>
          ) : hasTimer ? (
            <>
              ends in{" "}
              <SaleCountdown className="text-base font-semibold text-monitor-accent" />
            </>
          ) : (
            <>limited launch offer</>
          )}
        </span>
      </div>

      <div className="flex flex-col gap-7 p-7 sm:p-9">
        {/* Price anchor */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-monitor-muted">
            <span>
              Total value{" "}
              <span className="line-through">{symbol}{stackValue}</span>
            </span>
            <span className="text-monitor-line">/</span>
            <span>
              Normally <span className="line-through">{symbol}{listPrice}</span>
            </span>
          </div>
          <div className="flex items-end gap-4">
            <span className="font-mono text-7xl font-semibold leading-none tracking-tighter text-monitor-fg">
              {symbol}{price}
            </span>
            <div className="mb-1 flex flex-col">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-monitor-accent">
                Today only
              </span>
              <span className="font-mono text-xs text-monitor-muted">
                one time, yours to keep
              </span>
            </div>
          </div>
          <span className="font-mono text-xs text-monitor-muted">
            That is {savings}% off, less than one takeout dinner, for a 90-day
            program built around your scan.
          </span>
        </div>

        {/* Loss frame */}
        <p className="border-l-2 border-monitor-alert/50 pl-4 text-base leading-relaxed text-monitor-fg">
          {hasYears ? (
            <>
              <span className="font-mono text-monitor-alert">
                {formatYears(recoverableYears)} years
              </span>{" "}
              are still up for grabs. That date you saw assumes you do nothing.
              Doing nothing is what costs you.
            </>
          ) : (
            <>
              Your risks are already low. This locks in the years you have and
              pushes you to the top of your range.
            </>
          )}
        </p>

        <CheckoutButton answers={answers} />

        {/* Price-jump warning */}
        {hasTimer && !expired && (
          <p className="text-center font-mono text-xs text-monitor-muted">
            When the timer hits zero the price returns to {symbol}{expiredPrice}.
          </p>
        )}
      </div>
    </div>
  );
}

export function GuidePitch({
  result,
  answers,
}: {
  result?: ScanResult;
  answers?: Answers;
}) {
  const { symbol, currency, stackValue } = useSale();
  const recoverableYears = result?.recoverableYears ?? 0;
  const outcomes = result?.outcomes?.length ? result.outcomes : GENERIC_OUTCOMES;
  const topRisk = result?.topRisks?.[0];
  const personalized = Boolean(result);
  const hasYears = recoverableYears > 0;

  const headline = outcomes[0]?.label ?? "Add years back to your life";

  const subline = !personalized
    ? `${PRODUCT.tagline} A day-by-day plan you will actually stick to.`
    : hasYears
      ? `As much as ${formatYears(recoverableYears)} of those years are still yours to take back, and they come from the exact habits this plan is built to change.`
      : "This is the plan that pushes your date later and keeps it there.";

  // Gender-keyed targeting module under the promise. Speaks to what each
  // audience actually worries about; stays deadpan and concrete. Uses the
  // per-gender trace tint (a secondary monitor channel color), never the
  // brand accent or the mortality red.
  const sex = answers?.sex;
  const genderModule =
    sex === "male"
      ? {
          eyebrow: "Calibrated: male profile",
          line: "Built for how men lose years: heart, strength, and the slow slide in drive and recovery most men write off as age.",
          bullets: [
            "Strength-first training that defends muscle, and the testosterone output that depends on it",
            "Conditioning that pulls your resting heart rate down before a doctor brings it up",
            "Recovery rules built for long workweeks, not spa-day advice",
          ],
          text: "text-monitor-trace-m",
          border: "border-monitor-trace-m/40",
          bg: "bg-monitor-trace-m/[0.05]",
        }
      : sex === "female"
        ? {
            eyebrow: "Calibrated: female profile",
            line: "Built for how women lose good years: muscle and bone that slip quietly, energy that frays, and a system built to protect both.",
            bullets: [
              "Strength training that protects bone density and lean muscle through every hormonal stage",
              "Protein and fueling targets set for women, not scaled-down men's numbers",
              "Recovery built for sleep that breaks up at night, not textbook sleep",
            ],
            text: "text-monitor-trace-f",
            border: "border-monitor-trace-f/40",
            bg: "bg-monitor-trace-f/[0.05]",
          }
        : null;

  return (
    <section className="border-t border-monitor-line px-6 py-20">
      <div className="mx-auto flex max-w-2xl flex-col gap-16">
        {/* ── Promise ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            Your personalized protocol
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-monitor-fg md:text-5xl">
            {headline}
          </h2>
          <p className="max-w-[54ch] text-lg leading-relaxed text-monitor-muted">
            {subline}
            {personalized && topRisk ? (
              <>
                {" "}
                It starts with {topRisk.category.toLowerCase()}, the single
                biggest thing dragging your number down, then works down your
                list in order of impact.
              </>
            ) : null}
          </p>
          {genderModule ? (
            <div
              className={`flex flex-col gap-3 rounded-xl border ${genderModule.border} ${genderModule.bg} p-5`}
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.2em] ${genderModule.text}`}
              >
                {genderModule.eyebrow}
              </span>
              <p className="max-w-[54ch] text-sm leading-relaxed text-monitor-fg">
                {genderModule.line}
              </p>
              <ul className="flex flex-col gap-2">
                {genderModule.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className={`mt-0.5 font-mono text-xs font-bold ${genderModule.text}`}
                    >
                      +
                    </span>
                    <span className="text-sm leading-snug text-monitor-muted">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* ── Value stack ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
              Everything in your protocol
            </h3>
            <span className="font-mono text-xs text-monitor-muted">
              value <span className="text-monitor-fg">{symbol}{stackValue}</span>
            </span>
          </div>
          <ul className="divide-y divide-monitor-line border-y border-monitor-line">
            {INCLUDED.map((item) => (
              <li
                key={item.label}
                className="flex items-start justify-between gap-4 py-3.5"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 font-mono text-xs font-bold text-monitor-accent"
                  >
                    +
                  </span>
                  <span className="text-sm leading-snug text-monitor-fg">
                    {item.label}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs text-monitor-muted line-through">
                  {symbol}{localizedValue(item.value, currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── The offer ────────────────────────────────────────────── */}
        <OfferModule recoverableYears={recoverableYears} answers={answers} />

        {/* ── Proof ────────────────────────────────────────────────── */}
        <TransformationsGallery />
        <Reviews />

        {/* ── FAQ (objection handling) ─────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            Common questions
          </h3>
          <div className="divide-y divide-monitor-line border-y border-monitor-line">
            {PITCH_FAQS.map((faq) => (
              <div key={faq.q} className="flex flex-col gap-1.5 py-4">
                <span className="text-sm font-semibold text-monitor-fg">
                  {faq.q}
                </span>
                <span className="text-sm leading-relaxed text-monitor-muted">
                  {faq.a}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Close ────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="max-w-[44ch] text-lg leading-relaxed text-monitor-fg">
            {hasYears
              ? "You already did the hard part by looking. Now do something about it and change the number."
              : "You already did the hard part by looking. Now build the plan that keeps it that way."}
          </p>
          <CheckoutButton label="Start winning back your years" answers={answers} />
        </div>
      </div>
    </section>
  );
}
