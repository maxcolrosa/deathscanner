"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PRODUCT } from "@/lib/product";

interface SaleState {
  /** Seconds left on the offer, or null when there is no active timer. */
  remaining: number | null;
  expired: boolean;
  /** Current price (sale price, or the higher price once the timer expires). */
  price: number;
  /** The price the offer rises to when the countdown ends. */
  expiredPrice: number;
  listPrice: number;
}

// Default used when a consumer renders outside a provider (e.g. the evergreen
// /guide page): no timer, standard sale price, never expired.
const DEFAULT: SaleState = {
  remaining: null,
  expired: false,
  price: PRODUCT.price,
  expiredPrice: PRODUCT.expiredPrice,
  listPrice: PRODUCT.listPrice,
};

const SaleContext = createContext<SaleState>(DEFAULT);

export const useSale = () => useContext(SaleContext);

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const STORAGE_KEY = "sw_offer_deadline";

export function SaleProvider({
  durationSeconds = 900,
  children,
}: {
  durationSeconds?: number;
  children: React.ReactNode;
}) {
  // The deadline is PERSISTED in the browser, so a refresh or a fresh scan does
  // not reset the offer. This keeps the urgency honest: the window is a real,
  // one-time countdown per visitor, and once it ends the price genuinely stays
  // up. The stored deadline is read once in a lazy initializer (read-only, no
  // writes during render). `remaining` starts from the full duration so the
  // first paint matches between server and client; the tick effect corrects it.
  const [deadline] = useState(() => {
    const fresh = Date.now() + durationSeconds * 1000;
    if (typeof window === "undefined") return fresh;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? Number.parseInt(stored, 10) : Number.NaN;
      return Number.isFinite(parsed) ? parsed : fresh;
    } catch {
      return fresh;
    }
  });
  const [remaining, setRemaining] = useState(durationSeconds);

  // Persist the deadline (write happens in an effect, never during render).
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(deadline));
    } catch {
      // Private mode or storage disabled: the in-memory window still works.
    }
  }, [deadline]);

  useEffect(() => {
    const tick = () =>
      setRemaining(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const expired = remaining <= 0;
  const value: SaleState = {
    remaining,
    expired,
    price: expired ? PRODUCT.expiredPrice : PRODUCT.price,
    expiredPrice: PRODUCT.expiredPrice,
    listPrice: PRODUCT.listPrice,
  };

  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
}
