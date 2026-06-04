import Image, { type StaticImageData } from "next/image";
import { TRANSFORMATIONS } from "@/lib/guide/testimonials";

function Frame({ src, label }: { src: StaticImageData; label: string }) {
  return (
    <div className="relative aspect-[3/4] min-w-0 flex-1 overflow-hidden rounded-md border border-monitor-line bg-monitor-bg">
      <Image
        src={src}
        alt={`${label} photo`}
        fill
        placeholder="blur"
        className="object-cover"
        sizes="(max-width: 640px) 45vw, 180px"
      />
      {/* Label badge — top-left, monospace, no emoji, no disclaimer */}
      <span className="absolute left-2 top-2 rounded-sm border border-monitor-line bg-monitor-bg/90 px-1.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.18em] text-monitor-muted">
        {label}
      </span>
    </div>
  );
}

export function TransformationsGallery({
  heading = "Real results from the protocol",
}: {
  heading?: string;
}) {
  return (
    <section className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-monitor-muted">
          {heading}
        </span>
        <span className="h-px flex-1 bg-monitor-line" />
        <span className="font-mono text-[10px] tabular-nums text-monitor-muted">
          {TRANSFORMATIONS.length}
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {TRANSFORMATIONS.map((t, i) => (
          <div
            key={t.name}
            style={{ animationDelay: `${i * 70}ms` }}
            className={[
              "group relative flex flex-col gap-3 overflow-hidden rounded-lg",
              "border border-monitor-line bg-monitor-panel p-4",
              "transition-colors duration-200 hover:border-monitor-accent/30",
              "animate-[fadeSlideIn_0.35s_ease_both]",
            ].join(" ")}
          >
            {/* Accent top-edge on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-monitor-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />

            {/* Before / After frames */}
            <div className="flex gap-2">
              <Frame src={t.beforeSrc} label="Before" />
              <Frame src={t.afterSrc} label="After" />
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between border-t border-monitor-line pt-3">
              <span className="text-sm font-semibold tracking-tight text-monitor-fg">
                {t.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-monitor-muted">
                Verified
              </span>
            </div>
          </div>
        ))}
      </div>

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
        <a href="/terms" className="text-monitor-accent hover:underline">
          See our Terms.
        </a>
      </p>
    </section>
  );
}
