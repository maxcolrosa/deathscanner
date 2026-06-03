import { TESTIMONIALS } from "@/lib/guide/testimonials";

export function Reviews({ heading = "What people say" }: { heading?: string }) {
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

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.name}
            style={{ animationDelay: `${i * 60}ms` }}
            className={[
              "group relative flex flex-col gap-4 overflow-hidden rounded-lg",
              "border border-monitor-line bg-monitor-panel",
              "p-5 transition-colors duration-200",
              "hover:border-monitor-accent/30 hover:bg-monitor-panel",
              /* stagger fade-in via CSS animation */
              "animate-[fadeSlideIn_0.35s_ease_both]",
            ].join(" ")}
          >
            {/* Accent top-edge on hover — purely decorative, no glow */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-monitor-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />

            {/* Quote */}
            <blockquote className="text-sm leading-[1.65] tracking-[-0.01em] text-monitor-fg">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Attribution */}
            <figcaption className="flex items-center gap-2 font-mono text-[11px]">
              <span className="font-semibold text-monitor-fg">{t.name}</span>
              <span className="text-monitor-line" aria-hidden>
                /
              </span>
              <span className="text-monitor-muted">{t.detail}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Keyframe — scoped inline so no global CSS file needed */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
