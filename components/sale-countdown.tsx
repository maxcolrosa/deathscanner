"use client";

import { useEffect, useState } from "react";

// A single sale deadline shared across every countdown instance (sticky bar,
// result CTA, price block) via sessionStorage, so they all tick in sync and the
// urgency persists while the user reads the page.
const SALE_SECONDS = 15 * 60;
const KEY = "ls_sale_deadline";

function format(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SaleCountdown({ className = "" }: { className?: string }) {
  const [remaining, setRemaining] = useState(SALE_SECONDS);

  useEffect(() => {
    let deadline: number;
    const stored = sessionStorage.getItem(KEY);
    if (stored) {
      deadline = Number(stored);
    } else {
      deadline = Date.now() + SALE_SECONDS * 1000;
      sessionStorage.setItem(KEY, String(deadline));
    }

    const tick = () =>
      setRemaining(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`font-mono tabular-nums ${className}`} aria-live="off">
      {format(remaining)}
    </span>
  );
}
