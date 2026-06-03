// The single place to edit the funnel product. Swap these values, or wire the
// CheckoutButton to Stripe later, without touching the UI.
export const PRODUCT = {
  name: "The Second Wind Protocol",
  tagline: "A personalized 8-week protocol built from your scan.",
  /** Live (sale) price the user pays before the countdown ends. */
  price: 9,
  /** Price after the on-page countdown expires. */
  expiredPrice: 19,
  /** Anchor: the "normal" price, shown struck through. */
  listPrice: 79,
  /** Anchor: total itemized value of everything included. */
  stackValue: 294,
} as const;

// Itemized value stack. Sum of `value` equals PRODUCT.stackValue.
export const INCLUDED = [
  {
    label: "Your custom 8-week plan, built from your scan",
    note: "Targets your highest-impact risks first, in order.",
    value: 89,
  },
  {
    label: "The metabolic reset: exactly what to eat",
    note: "No counting, no guesswork. Just a list and a rhythm.",
    value: 69,
  },
  {
    label: "Sleep and stress recovery system",
    note: "Get your nights and your nervous system back.",
    value: 49,
  },
  {
    label: "The 10-minute daily routine",
    note: "Short enough that 'no time' stops being the reason.",
    value: 39,
  },
  {
    label: "Weekly recalibration as you improve",
    note: "The plan tightens as your numbers move.",
    value: 29,
  },
  {
    label: "A private community doing the same thing",
    note: "The accountability that makes it stick.",
    value: 19,
  },
] as const;
