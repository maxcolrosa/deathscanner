"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSale } from "@/components/sale-context";

// Placeholder checkout. To go live, replace the click handler with a Stripe
// Checkout Session redirect or a Payment Link. This is the only file that
// must change. The displayed price follows the on-page sale timer.
export function CheckoutButton({ label }: { label?: string }) {
  const { price } = useSale();
  const [clicked, setClicked] = useState(false);
  const text = label ?? `Get instant access for $${price}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={() => setClicked(true)}
        className="w-full bg-monitor-accent px-8 py-7 text-base font-semibold text-monitor-bg hover:bg-monitor-accent/90"
      >
        {text}
      </Button>
      <p className="font-mono text-xs text-monitor-muted">
        One-time payment. Instant access. Yours to keep.
      </p>
      {clicked ? (
        <p className="font-mono text-xs text-monitor-alert">
          Checkout is not wired up yet. This is where Stripe would take your money.
        </p>
      ) : null}
    </div>
  );
}
