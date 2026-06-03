import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MonitorVisual } from "@/components/monitor-visual";
import { Disclaimer } from "@/components/disclaimer";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="px-6">
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
            Our AI longevity model weighs your lifestyle against millions of
            actuarial records to estimate your date of death. Then it shows you how
            to move it.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/scan"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
              )}
            >
              Begin AI Assessment
            </Link>
            <span className="font-mono text-xs text-monitor-muted">
              Takes about 90 seconds
            </span>
          </div>
          <Disclaimer className="mt-2 max-w-[55ch]" />
        </div>

        <MonitorVisual />
      </section>
    </main>
  );
}
