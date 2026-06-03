import { CheckoutButton } from "@/components/checkout-button";
import { Disclaimer } from "@/components/disclaimer";
import { PRODUCT, INCLUDED } from "@/lib/product";
import type { ScanResult } from "@/lib/longevity";

const TESTIMONIALS = [
  {
    quote:
      "My scan said 61. Six months on the protocol and my doctor cut my blood pressure meds. Worth a hundred times the price.",
    name: "Marcus Brenner",
    detail: "Down 24 lbs, age 43",
  },
  {
    quote:
      "I am not a fitness person. The plan was simple enough that I actually stuck to it. First thing that ever worked.",
    name: "Priya Naidoo",
    detail: "Reversed prediabetes, age 38",
  },
];

function formatYears(years: number): string {
  return (Math.round(years * 10) / 10).toFixed(1);
}

export function GuidePitch({ result }: { result?: ScanResult }) {
  const recoverableYears = result?.recoverableYears ?? 0;
  const topRecoverable = result?.topRecoverable ?? [];
  const personalized = recoverableYears > 0;

  const headline = personalized
    ? `Add ${formatYears(recoverableYears)} years back to your life`
    : "Add years back to your life";

  return (
    <section className="border-t border-monitor-line px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-12">
        {/* Hook + outcome */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            Your personalized protocol
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-monitor-fg md:text-5xl">
            {headline}
          </h2>
          <p className="max-w-[55ch] text-lg leading-relaxed text-monitor-muted">
            {personalized
              ? `Your scan flagged ${topRecoverable.length} reversible risks costing you years right now. ${PRODUCT.name} is built to reverse exactly those, with a day-by-day plan you will actually follow.`
              : `${PRODUCT.tagline} A day-by-day plan you will actually follow.`}
          </p>
        </div>

        {/* Custom-to-results: the exact risks their plan targets */}
        {personalized ? (
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
              Your plan targets
            </h3>
            <ul className="flex flex-col divide-y divide-monitor-line rounded-lg border border-monitor-line bg-monitor-panel">
              {topRecoverable.map((factor) => (
                <li
                  key={factor.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <span className="text-sm text-monitor-fg">{factor.category}</span>
                  <span className="shrink-0 font-mono text-sm text-monitor-accent">
                    up to +{formatYears(-factor.deltaYears)} yr
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Value stack */}
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            Everything inside
          </h3>
          <ul className="flex flex-col divide-y divide-monitor-line rounded-lg border border-monitor-line bg-monitor-panel">
            {INCLUDED.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <span className="text-sm text-monitor-fg">{item.label}</span>
                <span className="shrink-0 font-mono text-sm text-monitor-muted">
                  ${item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price anchor + primary CTA */}
        <div className="flex flex-col items-center gap-5 rounded-lg border border-monitor-accent/40 bg-monitor-panel p-8 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-sm text-monitor-muted">
              Total value{" "}
              <span className="line-through">${PRODUCT.stackValue}</span>
            </span>
            <span className="font-mono text-sm text-monitor-muted">
              Normally <span className="line-through">${PRODUCT.listPrice}</span>
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
                Today
              </span>
              <span className="font-mono text-6xl tracking-tighter text-monitor-fg">
                ${PRODUCT.price}
              </span>
            </div>
          </div>
          <CheckoutButton />
        </div>

        {/* Risk reversal */}
        <div className="rounded-lg border border-monitor-line bg-monitor-panel p-6">
          <p className="text-base leading-relaxed text-monitor-fg">
            <span className="font-semibold text-monitor-accent">
              {PRODUCT.guaranteeDays}-day money-back guarantee.
            </span>{" "}
            Follow the protocol for {PRODUCT.guaranteeDays} days. If you do not feel
            the difference, email us and we refund every cent. The risk is ours.
          </p>
        </div>

        {/* Social proof */}
        <div className="flex flex-col gap-5">
          <p className="font-mono text-sm text-monitor-muted">
            Rated {PRODUCT.rating} out of 5 by{" "}
            {PRODUCT.buyers.toLocaleString("en-US")} people.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col gap-3 rounded-lg border border-monitor-line bg-monitor-panel p-5"
              >
                <blockquote className="text-sm leading-relaxed text-monitor-fg">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="font-mono text-xs text-monitor-muted">
                  {t.name}. {t.detail}.
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="flex flex-col items-center gap-2">
          <CheckoutButton label={`Start reclaiming your years for $${PRODUCT.price}`} />
        </div>

        <Disclaimer className="max-w-[60ch]" />
      </div>
    </section>
  );
}
