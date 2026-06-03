import { CheckoutButton } from "@/components/checkout-button";
import { Disclaimer } from "@/components/disclaimer";
import { PRODUCT } from "@/lib/product";

const BENEFITS = [
  {
    stat: "8 wk",
    body: "A structured reset for fat loss and energy, no equipment required.",
  },
  {
    stat: "20 min",
    body: "Daily sessions short enough that even your worst self will comply.",
  },
  {
    stat: "0 fads",
    body: "No detox teas, no fasting cults. Boring methods that actually work.",
  },
];

export function GuidePitch({ recoverableYears }: { recoverableYears: number }) {
  const headline =
    recoverableYears > 0
      ? `Reclaim your ${recoverableYears} years`
      : "Stay ahead of the curve";

  return (
    <section className="border-t border-monitor-line px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            {PRODUCT.name}
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-monitor-fg">
            {headline}
          </h2>
          <p className="max-w-[55ch] text-base leading-relaxed text-monitor-muted">
            {PRODUCT.tagline} The scan found the damage. This is the part where you
            do something about it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.stat}
              className="rounded-lg border border-monitor-line bg-monitor-panel p-5"
            >
              <div className="font-mono text-2xl tracking-tighter text-monitor-accent">
                {b.stat}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-monitor-muted">
                {b.body}
              </p>
            </div>
          ))}
        </div>

        <CheckoutButton />
        <Disclaimer className="max-w-[60ch]" />
      </div>
    </section>
  );
}
