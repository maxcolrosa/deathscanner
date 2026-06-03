"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PRODUCT } from "@/lib/product";

// Placeholder checkout. To go live, replace handleClick with a Stripe Checkout
// Session redirect or a Payment Link. This is the only file that must change.
export function CheckoutButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => setClicked(true)}
        className="bg-monitor-accent px-8 py-6 text-base text-monitor-bg hover:bg-monitor-accent/90"
      >
        Get the protocol for ${PRODUCT.priceUsd}
      </Button>
      {clicked ? (
        <p className="font-mono text-xs text-monitor-muted">
          Checkout is not wired up yet. This is where Stripe would take your money.
        </p>
      ) : null}
    </div>
  );
}
