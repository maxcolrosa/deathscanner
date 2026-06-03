"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PRODUCT } from "@/lib/product";

interface SaleState {
  /** Seconds left on the offer, or null when there is no active timer. */
  remaining: number | null;
  expired: boolean;
  /** Current price (sale price, or the higher price once the timer expires). */
  price: number;
  listPrice: number;
}

// Default used when a consumer renders outside a provider (e.g. the evergreen
// /guide page): no timer, standard sale price, never expired.
const DEFAULT: SaleState = {
  remaining: null,
  expired: false,
  price: PRODUCT.price,
  listPrice: PRODUCT.listPrice,
};

const SaleContext = createContext<SaleState>(DEFAULT);

export const useSale = () => useContext(SaleContext);

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SaleProvider({
  durationSeconds = 900,
  children,
}: {
  durationSeconds?: number;
  children: React.ReactNode;
}) {
  // The deadline is fixed once, on mount (i.e. when the result page lands). It is
  // never persisted, so a refresh or a fresh scan remounts this and resets it.
  const [deadline] = useState(() => Date.now() + durationSeconds * 1000);
  const [remaining, setRemaining] = useState(durationSeconds);

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
    listPrice: PRODUCT.listPrice,
  };

  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
}
