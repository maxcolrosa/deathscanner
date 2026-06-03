import { CheckoutButton } from "@/components/checkout-button";
import { Disclaimer } from "@/components/disclaimer";
import { PRODUCT, INCLUDED } from "@/lib/product";
import type { Outcome, ScanResult } from "@/lib/longevity";

// Shown on the standalone /guide page where there is no scan result.
const GENERIC_OUTCOMES: Outcome[] = [
  { id: "fat", label: "Lose stubborn body fat" },
  { id: "cardio", label: "Rebuild your cardiovascular fitness" },
  { id: "energy", label: "Stabilize your energy and sleep" },
  { id: "longevity", label: "Move your projected date in the right direction" },
];

function formatYears(years: number): string {
  return (Math.round(years * 10) / 10).toFixed(0);
}

export function GuidePitch({ result }: { result?: ScanResult }) {
  const recoverableYears = result?.recoverableYears ?? 0;
  const outcomes = result?.outcomes?.length ? result.outcomes : GENERIC_OUTCOMES;
  const personalized = Boolean(result);

  const headline = outcomes[0]?.label ?? "Add years back to your life";

  const subline = !personalized
    ? `${PRODUCT.tagline} A day-by-day plan you will actually follow.`
    : recoverableYears > 0
      ? `Built from your scan to reclaim the ${formatYears(recoverableYears)} years your habits are costing you, starting with what moves the needle most for you.`
      : `Built from your scan to push you toward the top of your range and keep you there.`;

  return (
    <section className="border-t border-monitor-line px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-12">
        {/* Results-based hook */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            Your personalized protocol
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-monitor-fg md:text-5xl">
            {headline}
          </h2>
          <p className="max-w-[55ch] text-lg leading-relaxed text-monitor-muted">
            {subline}
          </p>
        </div>

        {/* Concrete, results-based outcomes derived from their answers */}
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            What 8 weeks will do for you
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
              Total value <span className="line-through">${PRODUCT.stackValue}</span>
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

        {/* Final CTA */}
        <CheckoutButton label={`Start reclaiming your years for $${PRODUCT.price}`} />

        <Disclaimer className="max-w-[60ch]" />
      </div>
    </section>
  );
}
