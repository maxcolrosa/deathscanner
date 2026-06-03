"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PRODUCT } from "@/lib/product";

// Placeholder checkout. To go live, replace handleClick with a Stripe Checkout
// Session redirect or a Payment Link. This is the only file that must change.
export function CheckoutButton({
  label = `Get instant access for $${PRODUCT.price}`,
}: {
  label?: string;
}) {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={() => setClicked(true)}
        className="w-full bg-monitor-accent px-8 py-7 text-base font-semibold text-monitor-bg hover:bg-monitor-accent/90"
      >
        {label}
      </Button>
      <p className="font-mono text-xs text-monitor-muted">
        One-time payment. Instant access. {PRODUCT.guaranteeDays}-day money-back
        guarantee.
      </p>
      {clicked ? (
        <p className="font-mono text-xs text-monitor-alert">
          Checkout is not wired up yet. This is where Stripe would take your money.
        </p>
      ) : null}
    </div>
  );
}
