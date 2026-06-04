import Link from "next/link";
import { TESTIMONIALS, type Testimonial } from "@/lib/guide/testimonials";

/* Total readers shown in the aggregate. Static social-proof figure. */
const READER_COUNT = 2847;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[3px]" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-3 w-3 ${i < rating ? "fill-monitor-accent" : "fill-monitor-line"}`}
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

function ReviewCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <figure
      style={{ animationDelay: `${index * 60}ms` }}
      className={[
        "group relative flex flex-col gap-4 overflow-hidden rounded-lg",
        "border border-monitor-line bg-monitor-panel p-5",
        "transition-colors duration-200 hover:border-monitor-accent/30",
        "animate-[fadeSlideIn_0.35s_ease_both]",
      ].join(" ")}
    >
      {/* Accent top-edge on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-monitor-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      {/* Header: monogram + name/meta + stars */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-md border border-monitor-accent/20 bg-monitor-accent/10 font-mono text-[11px] font-semibold tracking-tight text-monitor-accent"
        >
          {monogram(t.name)}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <figcaption className="truncate text-sm font-semibold tracking-tight text-monitor-fg">
              {t.name}
            </figcaption>
            <Stars rating={t.rating} />
          </div>
          <span className="truncate font-mono text-[10px] tracking-tight text-monitor-muted">
            {t.meta}
          </span>
        </div>
      </div>

      {/* Quote */}
      <blockquote className="text-sm leading-[1.65] tracking-[-0.01em] text-monitor-fg">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      {/* Footer: result tag + verified */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-monitor-line pt-3">
        <span className="font-mono text-[11px] font-medium text-monitor-accent">
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

export function Reviews({ heading = "What people say" }: { heading?: string }) {
  const avg =
    TESTIMONIALS.reduce((s, t) => s + t.rating, 0) / TESTIMONIALS.length;

  return (
    <section className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-monitor-muted">
          {heading}
        </span>
        <span className="h-px flex-1 bg-monitor-line" />
        <span className="font-mono text-[10px] tabular-nums text-monitor-muted">
          {TESTIMONIALS.length}
        </span>
      </div>

      {/* Aggregate rating */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-monitor-line bg-monitor-panel px-5 py-4">
        <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-monitor-fg">
          {avg.toFixed(1)}
        </span>
        <div className="flex flex-col gap-1">
          <Stars rating={Math.round(avg)} />
          <span className="font-mono text-[10px] tracking-tight text-monitor-muted">
            {READER_COUNT.toLocaleString()} verified readers
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid items-stretch gap-3 sm:grid-cols-2">
        {TESTIMONIALS.map((t, i) => (
          <ReviewCard key={t.name} t={t} index={i} />
        ))}
      </div>

      {/* Keyframe — scoped inline so no global CSS file needed */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Results disclaimer */}
      <p className="font-mono text-[10px] leading-relaxed text-monitor-muted">
        * Illustrative, including AI-generated images and reviews. Not real
        customers. Results vary and are not typical.{" "}
        <Link href="/terms" className="text-monitor-accent hover:underline">
          See our Terms.
        </Link>
      </p>
    </section>
  );
}
