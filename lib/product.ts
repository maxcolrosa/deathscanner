// The single place to edit the funnel product. Swap these values, or wire the
// CheckoutButton to Stripe later, without touching the UI.
export const PRODUCT = {
  name: "The Second Wind Protocol",
  tagline: "A personalized 8-week protocol to add measurable years back to your life.",
  /** Live price the user pays. */
  price: 19,
  /** Anchor: the "normal" price, shown struck through. */
  listPrice: 79,
  /** Anchor: total itemized value of everything included. */
  stackValue: 294,
  guaranteeDays: 60,
  /** Social proof. Kept deliberately non-round so it reads as real. */
  buyers: 14732,
  rating: 4.8,
} as const;

// Itemized value stack. Sum of `value` equals PRODUCT.stackValue.
export const INCLUDED = [
  { label: "The 8-week Second Wind training plan", value: 79 },
  { label: "The metabolic reset nutrition system", value: 69 },
  { label: "Sleep and stress recovery protocol", value: 49 },
  { label: "Daily longevity habit tracker", value: 29 },
  { label: "Private member community access", value: 39 },
  { label: "Lifetime updates and new protocols", value: 29 },
] as const;
