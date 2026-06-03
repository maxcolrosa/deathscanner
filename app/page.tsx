import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MonitorVisual } from "@/components/monitor-visual";
import { Reviews } from "@/components/reviews";
import { TransformationsGallery } from "@/components/transformations-gallery";
import { cn } from "@/lib/utils";

function BeginCta({ className }: { className?: string }) {
  return (
    <Link
      href="/scan"
      className={cn(
        buttonVariants({ variant: "default" }),
        "bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90 active:scale-[0.98] transition-transform duration-100",
        className
      )}
    >
      Begin AI Assessment
    </Link>
  );
}

export default function Home() {
  return (
    <main className="px-6">
      {/* Hero */}
      <section className="mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-12 py-20 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            AI Longevity Scan
          </span>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tighter text-monitor-fg md:text-6xl">
            Find out when
            <br />
            you will die.
          </h1>
          <p className="max-w-[48ch] text-base leading-relaxed text-monitor-muted">
            Our AI longevity model weighs your lifestyle against millions of actuarial records to
            estimate your date of death. Then it shows you how to move it.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <BeginCta />
            <span className="font-mono text-xs text-monitor-muted">Takes about 90 seconds</span>
          </div>
        </div>

        <MonitorVisual />
      </section>

      {/* Social proof band */}
      <section className="relative mx-auto max-w-5xl pb-24 pt-0">
        {/* Top rule: faint accent gradient fade into a hard line */}
        <div className="relative mb-20 h-px">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-monitor-accent/25 to-transparent" />
          <span className="absolute inset-0 bg-monitor-line" style={{ maskImage: "linear-gradient(to right, transparent, #fff 20%, #fff 80%, transparent)" }} />
        </div>

        {/* Section label row */}
        <div className="mb-16 flex items-center gap-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-monitor-accent">
            Evidence
          </span>
          <span className="h-px flex-1 bg-monitor-line" />
          <span className="font-mono text-[9px] tabular-nums text-monitor-muted">
            SEC_02
          </span>
        </div>

        {/* Content stack */}
        <div className="flex flex-col gap-20">
          <TransformationsGallery />
          <Reviews />
        </div>

        {/* Closing CTA block - asymmetric split */}
        <div className="mt-20 grid items-center gap-8 border border-monitor-line bg-monitor-panel px-8 py-10 sm:grid-cols-[1fr_auto]">
          {/* Left: copy */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-monitor-accent">
              Ready
            </span>
            <p className="text-lg font-medium leading-snug tracking-tight text-monitor-fg">
              See your number, then get the plan that moves it.
            </p>
          </div>

          {/* Right: CTA */}
          <div className="flex shrink-0 items-center gap-4">
            <BeginCta />
            <span className="font-mono text-[10px] text-monitor-muted">~90 sec</span>
          </div>
        </div>

        {/* Corner tick marks on the CTA block - purely decorative */}
        <div aria-hidden className="pointer-events-none absolute bottom-24 left-0 right-0">
          {/* intentionally empty — tick marks rendered via border-corner illusion above */}
        </div>
      </section>
    </main>
  );
}
