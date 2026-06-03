"use client";

import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import type { ScanResult } from "@/lib/longevity";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function ReportCard({
  result,
  onSeePlan,
}: {
  result: ScanResult;
  onSeePlan: () => void;
}) {
  const deathLabel = dateFormatter.format(result.predictedDeathDate);

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-20">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-alert">
          Scan complete
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          Your projected expiry
        </h2>
      </div>

      <div className="rounded-lg border border-monitor-alert/40 bg-monitor-panel p-8">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          Estimated date of death
        </div>
        <div className="mt-2 font-mono text-5xl tracking-tighter text-monitor-alert md:text-6xl">
          {deathLabel}
        </div>
        <div className="mt-4 font-mono text-sm text-monitor-fg">
          Age at death:{" "}
          <CountUp to={result.ageAtDeath} className="text-monitor-alert" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          Risk factor breakdown
        </h3>
        <ul className="flex flex-col divide-y divide-monitor-line">
          {result.factors.map((factor) => {
            const positive = factor.deltaYears >= 0;
            return (
              <li
                key={factor.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="text-sm text-monitor-fg">{factor.label}</span>
                <span
                  className={`font-mono text-sm ${
                    positive ? "text-monitor-accent" : "text-monitor-alert"
                  }`}
                >
                  {positive ? "+" : ""}
                  {factor.deltaYears} yr
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {result.recoverableYears > 0 ? (
        <div className="rounded-lg border border-monitor-accent/40 bg-monitor-panel p-6">
          <p className="text-lg text-monitor-fg">
            Good news. About{" "}
            <span className="font-mono text-monitor-accent">
              {result.recoverableYears} years
            </span>{" "}
            of those losses are recoverable. Your habits did this. Your habits can
            undo it.
          </p>
          <Button
            onClick={onSeePlan}
            className="mt-4 bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
          >
            See how to reclaim them
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-monitor-accent/40 bg-monitor-panel p-6">
          <p className="text-lg text-monitor-fg">
            Annoyingly, your habits are already excellent. You can still buy the
            guide to feel superior about it.
          </p>
          <Button
            onClick={onSeePlan}
            className="mt-4 bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
          >
            See the protocol
          </Button>
        </div>
      )}
    </section>
  );
}
