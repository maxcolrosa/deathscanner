"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

// Site-wide password gate UI. Password only, no username. Posts to /api/unlock,
// which verifies and sets the unlock cookie; on success we reload so the proxy
// re-evaluates and serves the page the visitor originally asked for.
export function UnlockGate() {
  const passwordId = useId();
  const errorId = useId();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/unlock", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (res.ok) {
          // Cookie is set; reload to let the proxy serve the real destination.
          window.location.reload();
          return;
        }
        setError(
          res.status === 429
            ? "Too many attempts. Wait a few minutes and try again."
            : "Incorrect password.",
        );
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-monitor-accent motion-reduce:animate-none" />
          Restricted terminal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          This site is private
        </h1>
        <p className="font-mono text-sm leading-relaxed text-monitor-muted">
          Enter the access password to continue. No account needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor={passwordId}
            className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted"
          >
            Password
          </label>
          <input
            id={passwordId}
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-md border border-monitor-line bg-monitor-panel px-4 py-3 font-mono text-base text-monitor-fg outline-none placeholder:text-monitor-muted/60 focus:border-monitor-accent"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-monitor-accent px-8 py-6 text-base font-semibold text-monitor-bg transition-transform hover:bg-monitor-accent/90 active:scale-[0.98] disabled:opacity-70"
        >
          {pending ? "Unlocking..." : "Unlock"}
        </Button>

        {error ? (
          <p id={errorId} className="font-mono text-xs text-monitor-alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
