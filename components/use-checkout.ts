"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startGuideGeneration } from "@/lib/guide/start";
import type { Answers } from "@/lib/longevity";

// Shared checkout action: starts guide generation and routes to the building
// page. `answers` is undefined on the generic /guide page, where there is no
// scan to build from; callers handle that case (see `ready`).
export function useCheckout(answers?: Answers) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const ready = Boolean(answers);

  const start = () => {
    if (!answers) return;
    setError(false);
    startTransition(async () => {
      try {
        const { token } = await startGuideGeneration(answers);
        router.push(`/guide/${token}`);
      } catch {
        setError(true);
      }
    });
  };

  return { start, pending, error, ready };
}
