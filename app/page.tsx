import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MonitorVisual } from "@/components/monitor-visual";
import { cn } from "@/lib/utils";

const ctaPrimary = cn(
  buttonVariants({ variant: "default" }),
  "h-12 bg-monitor-accent px-7 text-base font-semibold text-monitor-bg transition-transform hover:bg-monitor-accent/90 active:translate-y-px"
);

const STEPS = [
  {
    n: "01",
    title: "Answer the scan",
    body: "A short, clinical-style questionnaire about how you actually live. About 90 seconds.",
  },
  {
    n: "02",
    title: "The model runs your analysis",
    body: "Your answers are scored against population mortality patterns, factor by factor.",
  },
  {
    n: "03",
    title: "See your date, and how to move it",
    body: "Your projected date, the risks pulling it closer, and the protocol to push it back.",
  },
];

const FAQS = [
  {
    q: "How long does it take?",
    a: "About 90 seconds. The result appears the moment you finish.",
  },
  {
    q: "Do I need to sign up?",
    a: "No. No account, no email, and no card to run the scan. Your answers are processed in your browser.",
  },
  {
    q: "What do I actually get?",
    a: "A personalized longevity readout for free, then the option to unlock a full protocol built from your exact answers.",
  },
];

export default function Home() {
  return (
    <main className="px-6">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="mx-auto grid min-h-[88dvh] max-w-7xl items-center gap-14 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-monitor-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-monitor-accent" />
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-accent">
                AI Longevity Scan
              </span>
            </div>

            <h1 className="text-[2.9rem] font-semibold leading-[0.98] tracking-tighter text-monitor-fg sm:text-6xl">
              Find out when
              <br />
              you will die.
              <span className="mt-3 block text-monitor-accent">
                Then move the date.
              </span>
            </h1>

            <p className="max-w-[46ch] text-lg leading-relaxed text-monitor-muted">
              A diagnostic model weighs how you live against population mortality
              data and returns your projected date of death. Then it shows you,
              factor by factor, exactly how to push it back.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/scan" className={ctaPrimary}>
                Begin my scan
              </Link>
              <span className="font-mono text-xs text-monitor-muted">
                90 seconds. No signup, no card.
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t border-monitor-line pt-5 font-mono text-xs text-monitor-muted">
              <span>Scored against population data</span>
              <span className="text-monitor-line">/</span>
              <span>Private, processed in your browser</span>
              <span className="text-monitor-line">/</span>
              <span>Instant result</span>
            </div>
          </div>

          <MonitorVisual />
        </section>

        {/* ── How it works (connected stepper, not equal cards) ────────── */}
        <section className="mx-auto max-w-7xl border-t border-monitor-line py-20">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-muted">
            How the scan works
          </span>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-monitor-line bg-monitor-line sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="flex flex-col gap-3 bg-monitor-bg p-7"
              >
                <span className="font-mono text-3xl font-light tracking-tighter text-monitor-accent tabular-nums">
                  {step.n}
                </span>
                <span className="text-base font-semibold text-monitor-fg">
                  {step.title}
                </span>
                <span className="text-sm leading-relaxed text-monitor-muted">
                  {step.body}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── The redacted reveal (curiosity gap) ──────────────────────── */}
        <section className="mx-auto max-w-7xl border-t border-monitor-line py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Locked report panel */}
            <div className="relative overflow-hidden rounded-xl border border-monitor-alert/30 bg-monitor-panel p-8">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
                Estimated date of death
              </div>
              <div
                className="mt-2 select-none font-mono text-5xl tracking-tighter text-monitor-alert/30 blur-[6px] sm:text-6xl"
                aria-hidden
              >
                00 / 0000
              </div>
              <div className="mt-5 flex items-center gap-2.5 border-t border-monitor-line pt-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-monitor-muted">
                  Locked
                </span>
                <span className="text-sm text-monitor-fg">
                  Your result is hidden until you run the scan.
                </span>
              </div>
            </div>

            {/* Stakes copy */}
            <div className="flex flex-col gap-5">
              <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg sm:text-4xl">
                Most of what sets your date is not your genes.
              </h2>
              <p className="max-w-[52ch] text-lg leading-relaxed text-monitor-muted">
                It is the handful of daily habits the scan measures, and almost
                all of them are reversible. The only question is how many years
                you are leaving on the table right now, and whether you are
                willing to look.
              </p>
              <Link href="/scan" className={cn(ctaPrimary, "w-fit")}>
                Reveal my date
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl border-t border-monitor-line py-20">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-muted">
            Before you start
          </span>
          <div className="mt-8 max-w-3xl divide-y divide-monitor-line border-y border-monitor-line">
            {FAQS.map((faq) => (
              <div key={faq.q} className="flex flex-col gap-1.5 py-5">
                <span className="text-base font-semibold text-monitor-fg">
                  {faq.q}
                </span>
                <span className="text-sm leading-relaxed text-monitor-muted">
                  {faq.a}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl border-t border-monitor-line py-24">
          <div className="flex flex-col items-start gap-6">
            <h2 className="max-w-[20ch] text-4xl font-semibold tracking-tighter text-monitor-fg sm:text-5xl">
              Your date is already set. The only question is whether you look.
            </h2>
            <Link href="/scan" className={ctaPrimary}>
              Begin my scan
            </Link>
          </div>
        </section>
    </main>
  );
}
