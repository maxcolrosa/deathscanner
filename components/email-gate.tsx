"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { captureLead } from "@/lib/marketing/capture";
import type { Answers } from "@/lib/longevity";
import type { Currency } from "@/lib/product";

// Email wall between the analysis and the result reveal. Rendered OUTSIDE
// SaleProvider (before the result mounts), so it takes `currency` as a prop
// rather than reading useSale(). On a successful capture it calls onUnlock().
export function EmailGate({
  answers,
  currency,
  onUnlock,
}: {
  answers: Answers;
  currency: Currency;
  onUnlock: () => void;
}) {
  const emailId = useId();
  const consentId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(false);
    startTransition(async () => {
      try {
        await captureLead({ email, consented, answers, currency });
        onUnlock();
      } catch {
        setError(true);
      }
    });
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
          Analysis complete
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          Your result is ready
        </h2>
        <p className="font-mono text-sm text-monitor-muted">
          Enter your email to unlock your estimated date of death and your full
          breakdown. We will send you a copy to keep.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor={emailId}
            className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted"
          >
            Email
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error || undefined}
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-md border border-monitor-line bg-monitor-panel px-4 py-3 font-mono text-base text-monitor-fg outline-none placeholder:text-monitor-muted/60 focus:border-monitor-accent"
          />
        </div>

        <label
          htmlFor={consentId}
          className="flex cursor-pointer items-start gap-3 text-left"
        >
          <input
            id={consentId}
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-monitor-accent"
          />
          <span className="text-sm leading-snug text-monitor-fg">
            Email me tips and occasional offers (optional)
          </span>
        </label>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-monitor-accent px-8 py-6 text-base font-semibold text-monitor-bg hover:bg-monitor-accent/90 disabled:opacity-70"
        >
          {pending ? "Unlocking your results..." : "Unlock my results"}
        </Button>

        {error ? (
          <p id={errorId} className="font-mono text-xs text-monitor-alert">
            Something went wrong. Check your email address and try again.
          </p>
        ) : null}

        <p className="font-mono text-xs leading-relaxed text-monitor-muted">
          We will email your report and, if you opt in, occasional tips.
          Unsubscribe anytime. See our{" "}
          <a
            href="/privacy"
            className="text-monitor-accent underline-offset-2 hover:underline"
          >
            privacy policy
          </a>
          .
        </p>
      </form>
    </div>
  );
}
