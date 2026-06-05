import Link from "next/link";
import { TESTIMONIALS, type Testimonial } from "@/lib/guide/testimonials";
import { Reveal } from "@/components/landing/reveal";

// Social proof for the long-form landing page. Reads the SAME data the result
// page uses (lib/guide/testimonials.ts) so the numbers never drift. The
// aggregate (avg + reader count) matches components/reviews.tsx; the scans-run
// figure is the public top-of-funnel counter.

// Verified readers shown on the result page (components/reviews.tsx). Kept in
// sync by hand because it is a static social-proof figure in both places.
const READER_COUNT = 2847;
// Total scans run. Top-of-funnel counter, larger than buyers by design.
const SCANS_RUN = 31408;

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-[3px] ${className}`} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i < rating ? "fill-monitor-accent" : "fill-monitor-line"}`}
          aria-hidden
        >
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.51L10 14.13l-4.95 2.6.94-5.5-4-3.9 5.53-.8z" />
        </svg>
      ))}
    </div>
  );
}

function monogram(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ReviewCard({ t }: { t: Testimonial }) {
  return (
    <figure className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-xl border border-monitor-line bg-monitor-panel p-6 transition-colors duration-200 hover:border-monitor-accent/30">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-monitor-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-monitor-accent/20 bg-monitor-accent/10 font-mono text-xs font-semibold tracking-tight text-monitor-accent"
          >
            {monogram(t.name)}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <figcaption className="truncate text-sm font-semibold tracking-tight text-monitor-fg">
              {t.name}
            </figcaption>
            <span className="truncate font-mono text-[10px] tracking-tight text-monitor-muted">
              {t.meta}
            </span>
          </div>
        </div>
        <Stars rating={t.rating} />
      </div>

      <blockquote className="text-[0.95rem] leading-[1.65] tracking-[-0.01em] text-monitor-fg">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-monitor-line pt-4">
        <span className="font-mono text-xs font-medium text-monitor-accent">
          {t.detail}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-monitor-muted">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
            <circle cx="12" cy="12" r="10" className="fill-monitor-accent/80" />
            <path
              d="M7.5 12.5l3 3 6-6.5"
              className="stroke-monitor-bg"
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Verified buyer · {t.verifiedAgo}
        </span>
      </div>
    </figure>
  );
}

export function LandingProof() {
  const avg =
    TESTIMONIALS.reduce((s, t) => s + t.rating, 0) / TESTIMONIALS.length;

  return (
    <section className="mx-auto max-w-7xl border-t border-monitor-line py-20 sm:py-28">
      <Reveal className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-monitor-accent">
          The receipts
        </span>
        <h2 className="max-w-[20ch] text-3xl font-semibold leading-[1.05] tracking-tight text-monitor-fg sm:text-5xl">
          People who looked at their number, then changed it.
        </h2>
      </Reveal>

      {/* Aggregate stat bar */}
      <Reveal delay={0.05}>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-monitor-line bg-monitor-line sm:grid-cols-3">
          <div className="flex flex-col gap-2 bg-monitor-bg p-7">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-monitor-fg">
                {avg.toFixed(1)}
              </span>
              <Stars rating={Math.round(avg)} />
            </div>
            <span className="font-mono text-xs tracking-tight text-monitor-muted">
              Average rating from {READER_COUNT.toLocaleString()} verified readers
            </span>
          </div>
          <div className="flex flex-col gap-2 bg-monitor-bg p-7">
            <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-monitor-fg">
              {SCANS_RUN.toLocaleString()}
            </span>
            <span className="font-mono text-xs tracking-tight text-monitor-muted">
              Scans run and counting
            </span>
          </div>
          <div className="flex flex-col gap-2 bg-monitor-bg p-7">
            <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-monitor-fg">
              90<span className="text-2xl text-monitor-muted">s</span>
            </span>
            <span className="font-mono text-xs tracking-tight text-monitor-muted">
              From first question to your date
            </span>
          </div>
        </div>
      </Reveal>

      {/* Detailed reviews. The 4-star critical one is included for credibility. */}
      <div className="mt-4 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={Math.min(i, 3) * 0.05} className="h-full">
            <ReviewCard t={t} />
          </Reveal>
        ))}
      </div>

      <p className="mt-6 font-mono text-[10px] leading-relaxed text-monitor-muted">
        * Illustrative, including AI-generated images and reviews. Not real
        customers. Results vary and are not typical.{" "}
        <Link href="/terms" className="text-monitor-accent hover:underline">
          See our Terms.
        </Link>
      </p>
    </section>
  );
}
