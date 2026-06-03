"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TESTIMONIALS } from "@/lib/guide/testimonials";
import { retryGuideGeneration } from "@/lib/guide/start";
import { TransformationsGallery } from "@/components/transformations-gallery";

// Isolated pulsing dot, perpetual animation kept in its own component
// so it never causes re-renders in the parent.
function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-monitor-accent opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-monitor-accent" />
    </span>
  );
}

const BUILD_PHASES = [
  "Analyzing your risk factors",
  "Designing your training block",
  "Building your nutrition reset",
  "Personalizing your daily routine",
  "Writing your first 7 days",
  "Finalizing your protocol",
];

function RotatingStatus({ elapsed }: { elapsed: number }) {
  // Advance one phase every 4 seconds, holding on the last one.
  const index = Math.min(BUILD_PHASES.length - 1, Math.floor(elapsed / 4));
  return (
    <span className="font-mono text-xs text-monitor-muted">
      {BUILD_PHASES[index]}
      <span className="text-monitor-accent">...</span>
    </span>
  );
}

// Focused failed-state panel - terminal halt aesthetic, consistent with monitor theme.
function FailedPanel({
  token,
  onRetried,
}: {
  token: string;
  onRetried: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRetry() {
    startTransition(async () => {
      await retryGuideGeneration(token);
      onRetried();
    });
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-monitor-line bg-monitor-panel px-8 py-10">
      {/* Corner brackets - alert tint */}
      <div aria-hidden className="pointer-events-none absolute inset-4">
        <span className="absolute left-0 top-0 block h-5 w-5 border-l border-t border-monitor-alert/40" />
        <span className="absolute right-0 top-0 block h-5 w-5 border-r border-t border-monitor-alert/40" />
        <span className="absolute bottom-0 left-0 block h-5 w-5 border-b border-l border-monitor-alert/40" />
        <span className="absolute bottom-0 right-0 block h-5 w-5 border-b border-r border-monitor-alert/40" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Status label */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs text-monitor-alert">[ ! ]</span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-alert">
            Generation fault
          </span>
        </div>

        {/* Heading + descriptor */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-monitor-fg md:text-3xl">
            Generation hit a snag
          </h1>
          <p className="max-w-[52ch] text-base leading-relaxed text-monitor-muted">
            Something went wrong building your protocol. Your scan data is safe.
            Hit retry and the system will try again from the top.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-monitor-line" />

        {/* Retry CTA */}
        <div className="flex items-center gap-5">
          <button
            onClick={handleRetry}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded border border-monitor-accent bg-transparent px-5 py-2.5 font-mono text-sm text-monitor-accent transition-colors duration-200 hover:bg-monitor-accent/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Retrying..." : "Try again"}
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-monitor-muted/60">
            {isPending ? "Restarting synthesis" : "Restarts protocol synthesis"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function GuideBuildingScreen({
  token,
  failed,
}: {
  token: string;
  failed?: boolean;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Do not poll when in the failed state - it is terminal until the user retries.
    if (failed) return;

    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/guide/${token}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const { status } = (await res.json()) as { status: string };
        // Refresh on ready OR failed so the server re-renders with the correct state.
        if (status === "ready" || status === "failed") router.refresh();
      } catch {
        // transient; keep polling
      }
    }, 2500);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [token, router, failed]);

  const pct = Math.min(95, 20 + elapsed * 4);

  if (failed) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-14 px-6 pt-20 pb-28">
        <FailedPanel token={token} onRetried={() => router.refresh()} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-14 px-6 pt-20 pb-28">
      {/* ── Status block ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <PulsingDot />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            Building your protocol
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-monitor-fg md:text-4xl">
          Your Second Wind Protocol is being written
        </h1>

        <p className="max-w-[56ch] text-base leading-relaxed text-monitor-muted">
          We are turning your scan into a day-by-day plan that targets your
          highest-impact risks first. This usually takes under a minute.
        </p>

        {/* Progress track */}
        <div className="mt-1 flex flex-col gap-2">
          <div className="h-px w-full bg-monitor-line">
            <div
              className="h-px bg-monitor-accent transition-all duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-monitor-muted">
            <span className="uppercase tracking-[0.14em]">Protocol synthesis</span>
            <span>
              {pct.toFixed(0)}% &nbsp;&bull;&nbsp; {elapsed}s elapsed
            </span>
          </div>
          <RotatingStatus elapsed={elapsed} />
        </div>
      </div>

      {/* ── Transformations gallery ── */}
      <TransformationsGallery />

      {/* ── Testimonials ── */}
      <section className="flex flex-col gap-5">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          From people who ran it
        </h2>
        <ul className="flex flex-col gap-0 divide-y divide-monitor-line">
          {TESTIMONIALS.map((t) => (
            <li
              key={t.name}
              className="flex gap-5 py-5 first:pt-0 last:pb-0"
            >
              {/* Accent rail */}
              <div className="mt-1 w-px shrink-0 self-stretch bg-monitor-accent/30" />
              <div className="flex flex-col gap-2">
                <p className="text-base leading-relaxed text-monitor-fg">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-mono text-xs text-monitor-muted">
                    {t.name}
                  </span>
                  <span className="font-mono text-xs text-monitor-accent">
                    {t.detail}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
