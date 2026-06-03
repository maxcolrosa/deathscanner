"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSale } from "@/components/sale-context";
import { useCheckout } from "@/components/use-checkout";
import type { Answers } from "@/lib/longevity";

// When `answers` is provided (the result page), clicking starts real guide
// generation and redirects to the tokenized guide URL. Without `answers` (the
// generic /guide page), it keeps the placeholder message.
export function CheckoutButton({ label, answers }: { label?: string; answers?: Answers }) {
  const { price } = useSale();
  const { start, pending, error, ready } = useCheckout(answers);
  const [placeholder, setPlaceholder] = useState(false);
  const text = label ?? `Get instant access for $${price}`;

  const onClick = () => {
    if (!ready) {
      setPlaceholder(true);
      return;
    }
    start();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={onClick}
        disabled={pending}
        className="w-full bg-monitor-accent px-8 py-7 text-base font-semibold text-monitor-bg hover:bg-monitor-accent/90 disabled:opacity-70"
      >
        {pending ? "Building your protocol..." : text}
      </Button>
      <p className="font-mono text-xs text-monitor-muted">
        One-time payment. Instant access. Yours to keep.
      </p>
      {placeholder ? (
        <p className="font-mono text-xs text-monitor-alert">
          Run your scan first so we can build your personalized protocol.
        </p>
      ) : null}
      {error ? (
        <p className="font-mono text-xs text-monitor-alert">
          Something went wrong starting your plan. Please try again.
        </p>
      ) : null}
    </div>
  );
}
