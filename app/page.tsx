import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MonitorVisual } from "@/components/monitor-visual";
import { LandingProof } from "@/components/landing/proof";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const ctaPrimary = cn(
  buttonVariants({ variant: "default" }),
  "h-[3.25rem] bg-monitor-accent px-8 text-base font-semibold text-monitor-bg transition-transform hover:bg-monitor-accent/90 active:translate-y-px"
);

// The slow decline, named plainly. Each line is a small wound the visitor
// recognizes. This is the agitation: say their pain better than they can.
const DECLINE = [
  {
    head: "The stairs tell on you now.",
    body: "You used to take them two at a time. Now you notice them. Your body started keeping score and forgot to send the memo.",
  },
  {
    head: "You quit the last three programs by February.",
    body: "Not because you are lazy. Because they were built for someone with no job, no kids, and knees that still work. You were set up to fail.",
  },
  {
    head: "The years are leaving quietly.",
    body: "Nothing dramatic. A little less sleep, a little more on the scale, one more reason to sit down. Decline does not announce itself. It just accumulates.",
  },
  {
    head: "You already know the number is bad.",
    body: "That is the part that keeps you up. Not knowing how bad, and not knowing if it is too late. It is not too late. But the math gets worse every year you wait.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Answer the scan",
    body: "A short, clinical-style questionnaire about how you actually live. About 90 seconds, no card required.",
  },
  {
    n: "02",
    title: "The model runs your analysis",
    body: "Your answers are scored against population mortality patterns, factor by factor, with no flattering rounding.",
  },
  {
    n: "03",
    title: "See your date, and how to move it",
    body: "Your projected date, the risks pulling it closer, and the protocol built from your exact answers to push it back.",
  },
];

const FAQS = [
  {
    q: "How long does it take?",
    a: "About 90 seconds. The result appears the moment you finish, with no card required to see it.",
  },
  {
    q: "Is this a real medical prediction?",
    a: "It is a model that scores your habits against population longevity patterns and returns a projected date. It is built to make the cost of how you live impossible to ignore, not to replace a doctor.",
  },
  {
    q: "Will it just make me feel terrible?",
    a: "The date is the wake-up call. The point is the plan that comes with it: the specific, reversible habits moving your number, and exactly how to change them.",
  },
  {
    q: "What do I actually get?",
    a: "A personalized longevity readout for free, then the option to unlock a full 90-day protocol built from your exact answers, including an AI Deepscan that writes a marker-by-marker readout of your health, diet, and lifestyle.",
  },
];

export default function Home() {
  return (
    <main className="px-6">
      {/* ── Hero (80% of the effort lives here) ─────────────────────────── */}
      <section className="mx-auto grid min-h-[92dvh] max-w-7xl items-center gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <Reveal className="flex flex-col gap-7">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-monitor-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-monitor-accent" />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-accent">
              Vivrun
            </span>
          </div>

          <h1 className="text-[2.7rem] font-semibold leading-[0.96] tracking-tighter text-monitor-fg sm:text-[4.2rem]">
            Your body has a
            <br />
            <span className="text-monitor-alert">deadline.</span>
            <span className="mt-3 block text-monitor-accent">
              Find out when it is.
            </span>
          </h1>

          <p className="max-w-[48ch] text-lg leading-relaxed text-monitor-muted sm:text-xl">
            Every wasted day has a cost you cannot feel adding up. Our AI turns
            how you live into one number: the date, the reasons behind it, and
            the years you can still take back. 90 seconds to see it.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/scan" className={ctaPrimary}>
              Reveal my date
            </Link>
            <span className="font-mono text-xs text-monitor-muted">
              Takes 90 seconds. No card to see your result.
            </span>
          </div>

          {/* Proof microbar */}
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-monitor-line pt-5 font-mono text-xs text-monitor-muted">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold tabular-nums text-monitor-fg">
                31,408
              </span>{" "}
              scans run
            </span>
            <span className="text-monitor-line">/</span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold tabular-nums text-monitor-fg">
                4.8
              </span>{" "}
              average from 2,847 readers
            </span>
            <span className="text-monitor-line">/</span>
            <span>Built from your answers, not a template</span>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <MonitorVisual />
        </Reveal>
      </section>

      {/* ── Pain / agitation ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t border-monitor-line py-20 sm:py-28">
        <Reveal className="flex flex-col gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-muted">
            Read this part slowly
          </span>
          <h2 className="max-w-[24ch] text-3xl font-semibold leading-[1.05] tracking-tight text-monitor-fg sm:text-5xl">
            You can feel it happening. You just have not put a number on it.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-monitor-line bg-monitor-line lg:grid-cols-2">
          {DECLINE.map((item, i) => (
            <Reveal key={item.head} delay={(i % 2) * 0.06}>
              <div className="flex h-full flex-col gap-3 bg-monitor-bg p-8">
                <h3 className="text-xl font-semibold tracking-tight text-monitor-fg sm:text-2xl">
                  {item.head}
                </h3>
                <p className="text-base leading-relaxed text-monitor-muted">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.08}>
          <p className="mt-12 max-w-[60ch] text-xl font-medium leading-relaxed text-monitor-fg sm:text-2xl">
            None of that is a life sentence. Almost every habit setting your date
            is one you can change. The first move is the one nobody wants to make:{" "}
            <span className="text-monitor-accent">look at the number.</span>
          </p>
        </Reveal>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t border-monitor-line py-20 sm:py-28">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-muted">
            How the scan works
          </span>
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-monitor-line bg-monitor-line sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06} className="h-full">
              <div className="flex h-full flex-col gap-3 bg-monitor-bg p-7">
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Curiosity gap: the redacted reveal ──────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t border-monitor-line py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
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
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col gap-5">
            <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg sm:text-4xl">
              Most of what sets your date is not your genes.
            </h2>
            <p className="max-w-[52ch] text-lg leading-relaxed text-monitor-muted">
              It is the handful of daily habits the scan measures, and almost all
              of them are reversible. The only question is how many years you are
              leaving on the table right now, and whether you are willing to look.
            </p>
            <Link href="/scan" className={cn(ctaPrimary, "w-fit")}>
              Reveal my date
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Social proof ────────────────────────────────────────────────── */}
      <LandingProof />

      {/* ── Stakes / loss framing ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t border-monitor-line py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal className="flex flex-col gap-5">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-alert">
              What the date assumes
            </span>
            <h2 className="max-w-[22ch] text-3xl font-semibold leading-[1.05] tracking-tight text-monitor-fg sm:text-5xl">
              Your number assumes you do nothing. That is the cruel part.
            </h2>
            <p className="max-w-[54ch] text-lg leading-relaxed text-monitor-muted">
              The date the model returns is the path you are already on. Keep
              everything exactly as it is and the projection holds. Every week you
              tell yourself you will start later, the version of you that could
              have moved it gets a little harder to reach.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex flex-col divide-y divide-monitor-line rounded-xl border border-monitor-line bg-monitor-panel">
              <div className="flex items-center justify-between gap-4 p-6">
                <span className="text-base text-monitor-muted">
                  Wait another year
                </span>
                <span className="font-mono text-sm font-semibold text-monitor-alert">
                  the math gets worse
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 p-6">
                <span className="text-base text-monitor-muted">
                  Change a few daily habits
                </span>
                <span className="font-mono text-sm font-semibold text-monitor-accent">
                  the date moves back
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 p-6">
                <span className="text-base text-monitor-muted">
                  Look at it today
                </span>
                <span className="font-mono text-sm font-semibold text-monitor-accent">
                  costs you 90 seconds
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t border-monitor-line py-20 sm:py-28">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-muted">
            Before you start
          </span>
        </Reveal>
        <div className="mt-8 max-w-3xl divide-y divide-monitor-line border-y border-monitor-line">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} delay={Math.min(i, 3) * 0.04}>
              <div className="flex flex-col gap-1.5 py-5">
                <span className="text-base font-semibold text-monitor-fg">
                  {faq.q}
                </span>
                <span className="text-sm leading-relaxed text-monitor-muted">
                  {faq.a}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl border-t border-monitor-line py-24 sm:py-32">
        <Reveal className="flex flex-col items-start gap-7">
          <h2 className="max-w-[18ch] text-4xl font-semibold leading-[1.02] tracking-tighter text-monitor-fg sm:text-6xl">
            Your date is already set. The only question is whether you look.
          </h2>
          <p className="max-w-[48ch] text-lg leading-relaxed text-monitor-muted">
            Ninety seconds from now you will know the number, the risks behind it,
            and the first thing to change. Or you can keep guessing. The clock
            does not care which you pick.
          </p>
          <Link href="/scan" className={ctaPrimary}>
            Reveal my date
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
