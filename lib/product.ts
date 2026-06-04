// The single place to edit the funnel product. Swap these values, or wire the
// CheckoutButton to Stripe later, without touching the UI.
export const PRODUCT = {
  name: "The Second Wind Protocol",
  tagline: "A complete, personalized 90-day program built from your scan.",
  /** Live (sale) price the user pays before the countdown ends. */
  price: 13,
  /** Price after the on-page countdown expires. */
  expiredPrice: 24,
  /** Anchor: the "normal" price, shown struck through. */
  listPrice: 129,
  /** Anchor: total itemized value of everything included. */
  stackValue: 492,
} as const;

// Itemized value stack. Sum of `value` equals PRODUCT.stackValue (492).
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
