// The single place to edit the funnel product. Swap these values, or wire the
// CheckoutButton to Stripe later, without touching the UI.
//
// Pricing is multi-currency. PRICES holds the authored "charm" price points per
// currency (launch / expired / win-back / list anchor). The value-stack line
// items live in INCLUDED in USD and are converted to each currency with the
// tier `rate` (see localizedValue / stackValueFor), so the anchor math stays
// consistent everywhere without a second hand-maintained table.

export const PRODUCT = {
  name: "The Second Wind Protocol",
  tagline: "A complete, personalized 90-day program built from your scan.",
} as const;

export const SUPPORTED_CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export interface PriceTier {
  code: Currency;
  /** Symbol shown inline, kept deadpan and minimal (e.g. "$", "£", "CA$"). */
  symbol: string;
  /** Live (sale) price the user pays before the on-page countdown ends. */
  price: number;
  /** Price after the countdown expires. */
  expiredPrice: number;
  /** Recovery price the email win-back coupon resolves to (undercuts launch). */
  winbackPrice: number;
  /** Anchor: the "normal" price, shown struck through. */
  listPrice: number;
  /** USD -> currency multiplier used only to localize the value-stack items. */
  rate: number;
}

// Authored charm price points per currency. USD is the source of truth for the
// value stack (rate 1); the rest are rounded to believable local points.
export const PRICES: Record<Currency, PriceTier> = {
  USD: { code: "USD", symbol: "$", price: 13, expiredPrice: 24, winbackPrice: 9, listPrice: 129, rate: 1 },
  GBP: { code: "GBP", symbol: "£", price: 11, expiredPrice: 19, winbackPrice: 7, listPrice: 99, rate: 0.79 },
  EUR: { code: "EUR", symbol: "€", price: 12, expiredPrice: 22, winbackPrice: 8, listPrice: 119, rate: 0.92 },
  CAD: { code: "CAD", symbol: "CA$", price: 18, expiredPrice: 33, winbackPrice: 12, listPrice: 179, rate: 1.36 },
  AUD: { code: "AUD", symbol: "A$", price: 19, expiredPrice: 35, winbackPrice: 13, listPrice: 189, rate: 1.52 },
};

// Itemized value stack, authored in USD. Sum of `value` equals the USD stack
// value (492); other currencies derive their stack value via stackValueFor().
export const INCLUDED = [
  {
    label: "Your custom 90-day program, built from your scan",
    note: "Targets your highest-impact risks first, across a Foundation, Build, and Push phase.",
    value: 99,
  },
  {
    label: "The metabolic reset and recipe bank: real meals, macros, and a shopping list",
    note: "Calorie and protein estimates per recipe, aisle-grouped shopping list, plant-protein swaps included.",
    value: 89,
  },
  {
    label: "The exercise library: every movement, with form, cues, and swaps",
    note: "Setup, execution, common mistakes, an easier and a harder option for every exercise in your plan.",
    value: 69,
  },
  {
    label: "Your numbers dashboard and 90-day progress system",
    note: "Starting bands, targets, monthly review checkpoints, and decision rules for when to add load or hold.",
    value: 59,
  },
  {
    label: "Sleep and stress recovery system",
    note: "Get your nights and your nervous system back.",
    value: 49,
  },
  {
    label: "The science: why every step of the plan works",
    note: "Mechanism explanations for each major lever, grounded in well-established research.",
    value: 39,
  },
  {
    label: "Four bonus playbooks: plateaus, travel, supplements, and life after your 90 days",
    note: "Answers to the four situations that end most programs, before you hit them.",
    value: 49,
  },
  {
    label: "The printable kit: workbook, tracker pack, and quick-start",
    note: "Five downloadable PDFs. Print once, use every week. No app required.",
    value: 39,
  },
] as const;

/** A single USD value-stack item converted to `currency`, rounded to a whole. */
export function localizedValue(usdValue: number, currency: Currency): number {
  return Math.round(usdValue * PRICES[currency].rate);
}

/** Total value-stack worth in `currency` (the honest sum of localized items). */
export function stackValueFor(currency: Currency): number {
  return INCLUDED.reduce((sum, item) => sum + localizedValue(item.value, currency), 0);
}

// The amount to charge, in Stripe minor units (cents). Server-authoritative: the
// only inputs are the resolved currency and whether the on-page countdown has
// expired. All supported currencies are 2-decimal, so * 100 is correct.
export function chargeAmountMinor(currency: Currency, expired: boolean): number {
  const tier = PRICES[currency];
  return (expired ? tier.expiredPrice : tier.price) * 100;
}

// The recovery amount the email win-back link resolves to, in minor units.
// Only reachable via a server-verified signed token (see lib/marketing/winback).
export function winbackAmountMinor(currency: Currency): number {
  return PRICES[currency].winbackPrice * 100;
}
