"use client";

import { useSale, formatCountdown } from "@/components/sale-context";

// Renders the shared sale countdown. Renders nothing when there is no active
// timer (i.e. outside a SaleProvider, such as the evergreen /guide page).
export function SaleCountdown({ className = "" }: { className?: string }) {
  const { remaining } = useSale();
  if (remaining === null) return null;
  return (
    <span className={`font-mono tabular-nums ${className}`} aria-live="off">
      {formatCountdown(remaining)}
    </span>
  );
}
