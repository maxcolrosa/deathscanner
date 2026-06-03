"use client";

import { useSale } from "@/components/sale-context";
import { SaleCountdown } from "@/components/sale-countdown";
import { useCheckout } from "@/components/use-checkout";
import type { Answers } from "@/lib/longevity";

export function ResultStickyBar({
  recoverableYears,
  answers,
}: {
  recoverableYears: number;
  answers: Answers;
}) {
  const { price, expired } = useSale();
  const { start, pending } = useCheckout(answers);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-monitor-line bg-monitor-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 py-3 sm:flex-row sm:justify-between">
        <span className="text-sm text-monitor-fg">
          {recoverableYears > 0 ? (
            <>
              <span className="font-mono text-monitor-accent">
                {recoverableYears.toFixed(0)} years
              </span>{" "}
              are still on the table.
            </>
          ) : (
            <>Lock in the years you have.</>
          )}
        </span>
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <span className="hidden font-mono text-xs text-monitor-muted sm:inline">
            {expired ? (
              <>${price} now</>
            ) : (
              <>
                ${price} today, expires in <SaleCountdown className="text-monitor-accent" />
              </>
            )}
          </span>
          <button
            onClick={start}
            disabled={pending}
            className="w-full rounded-md bg-monitor-accent px-6 py-2.5 text-sm font-semibold text-monitor-bg transition-colors hover:bg-monitor-accent/90 disabled:opacity-70 sm:w-auto"
          >
            {pending ? "Building..." : "Build my plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
