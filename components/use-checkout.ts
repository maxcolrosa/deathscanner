"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { beginCheckout } from "@/lib/guide/checkout";
import { useSale } from "@/components/sale-context";
import type { Answers } from "@/lib/longevity";

// Shared checkout action. When Stripe is configured, beginCheckout returns a
// hosted Checkout URL and we redirect there; otherwise it returns a token and we
// route straight to the building page (today's no-payment fallback). The price
// the buyer is charged is decided server-side from `expired` + `currency`, both
// read here from useSale() so they match exactly what is on screen.
export function useCheckout(answers?: Answers) {
  const router = useRouter();
  const { expired, currency } = useSale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const ready = Boolean(answers);

  const start = () => {
    if (!answers) return;
    setError(false);
    startTransition(async () => {
      try {
        const result = await beginCheckout(answers, { expired, currency });
        if ("url" in result) {
          window.location.assign(result.url);
        } else {
          router.push(`/guide/${result.token}`);
        }
      } catch {
        setError(true);
      }
    });
  };

  return { start, pending, error, ready };
}
