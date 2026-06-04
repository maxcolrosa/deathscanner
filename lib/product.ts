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
  stackValue: 383,
} as const;

// Itemized value stack. Sum of `value` equals PRODUCT.stackValue (383).
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
    label: "Your numbers dashboard: starting bands, targets, and an 8-week milestone map",
    note: "One page that shows where you are, where you are going, and the checkpoints between.",
    value: 49,
  },
  {
    label: "The printable tracker pack: workout log, habit and measurement trackers, shopping list",
    note: "Print once, use every week. No app required.",
    value: 39,
  },
  {
    label: "Four bonus playbooks: plateaus, travel, supplements, and your next 8 weeks",
    note: "Answers to the four situations that end most programs, before you hit them.",
    value: 49,
  },
] as const;
