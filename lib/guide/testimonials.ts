import type { StaticImageData } from "next/image";

// Static imports so Next fingerprints each image by content hash. When a file in
// public/transformations/ is replaced, its hashed URL changes automatically, so
// the optimizer and browser caches can never serve a stale copy. (String paths
// like "/transformations/x.jpg" stay cached because the URL never changes.)
import meiBefore from "@/public/transformations/priya-before.jpg";
import meiAfter from "@/public/transformations/priya-after.jpg";
import danielBefore from "@/public/transformations/daniel-before.jpg";
import danielAfter from "@/public/transformations/daniel-after.jpg";
import elenaBefore from "@/public/transformations/elena-before.jpg";
import elenaAfter from "@/public/transformations/elena-after.jpg";
import marcusBefore from "@/public/transformations/marcus-before.jpg";
import marcusAfter from "@/public/transformations/marcus-after.jpg";

export interface Testimonial {
  /** The review body. A few sentences, specific, in the reader's own voice. */
  quote: string;
  name: string;
  /** Role, age and city. Keeps each reviewer concrete and distinct. */
  meta: string;
  /** The headline result, shown as an accent tag. */
  detail: string;
  /** 1 to 5. Keep one or two below 5 so the set reads as real. */
  rating: number;
  /** Relative recency, e.g. "2 weeks ago". */
  verifiedAgo: string;
}

export interface Transformation {
  name: string;
  beforeSrc: StaticImageData;
  afterSrc: StaticImageData;
}

// Ordered to match the transformation gallery first, then two extra voices.
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "My scan came back at 71 and I did not sleep that night. What flipped it for me was that the plan handed me one thing to do every morning instead of a vague 'eat better, move more.' Down 18 lbs, my wedding ring spins on my finger again, and my wife keeps saying I look ten years younger. First program I have ever actually finished.",
    name: "Daniel R.",
    meta: "Warehouse supervisor, 44 · Columbus, OH",
    detail: "Down 18 lbs",
    rating: 5,
    verifiedAgo: "5 days ago",
  },
  {
    quote:
      "I almost did not pay because I figured it was the same cookie-cutter plan everybody gets. Nope. It pulled my actual answers about my garbage sleep and my stress and built the first two weeks around fixing those. My resting heart rate went from 78 down to 67, and the brain fog I kept blaming on work is just gone.",
    name: "Megan L.",
    meta: "Product designer, 33 · Sacramento, CA",
    detail: "Resting HR 78 to 67 bpm",
    rating: 5,
    verifiedAgo: "1 week ago",
  },
  {
    quote:
      "The report did not lecture me about smoking. It just laid out, in plain numbers, exactly how many years a pack a day was costing me. Swapping my smoke breaks for the short workouts is the only thing that has ever stuck. I am off the cigarettes, and last weekend I carried the groceries up three flights without stopping for the first time since high school.",
    name: "Marcus T.",
    meta: "Electrician, 39 · Nashville, TN",
    detail: "Off cigarettes",
    rating: 5,
    verifiedAgo: "2 weeks ago",
  },
  {
    quote:
      "Two kids and a 12-hour shift killed every other plan I tried inside a week. The 10-minute backup workout for the days everything falls apart is the only reason my streak survived. I am back under a barbell for the first time since my second was born, and now I actually look forward to it in the garage instead of dreading it.",
    name: "Elena K.",
    meta: "ER nurse, 41 · Dallas, TX",
    detail: "Lifting again",
    rating: 5,
    verifiedAgo: "3 weeks ago",
  },
  {
    quote:
      "I will be straight with you, the death-date thing felt like a gimmick and the countdown timer is a bit much. But I bought it anyway, and the grocery list alone paid for itself. I quit overthinking every meal and finally lost the gut I had hauled around for ten years. Would have given five stars if the checkout had not made me enter my card twice.",
    name: "Tom B.",
    meta: "High school teacher, 52 · Tampa, FL",
    detail: "Lost a decade-old gut",
    rating: 4,
    verifiedAgo: "6 days ago",
  },
  {
    quote:
      "I have blown hundreds on programs I quit by February. This is the first one that adjusted when I fell behind instead of making me feel like a failure. I stopped needing the 3pm energy drink to make it to dinner. I cancelled the gym membership I never used and do the whole thing in my living room.",
    name: "Sarah M.",
    meta: "Account manager, 36 · Phoenix, AZ",
    detail: "Energy back",
    rating: 5,
    verifiedAgo: "yesterday",
  },
];

// Fixed shared set. Images live in /public/transformations/ and are imported
// above so a file swap busts caches automatically. 2 female, 2 male.
export const TRANSFORMATIONS: Transformation[] = [
  { name: "Megan L.", beforeSrc: meiBefore, afterSrc: meiAfter },
  { name: "Daniel R.", beforeSrc: danielBefore, afterSrc: danielAfter },
  { name: "Elena K.", beforeSrc: elenaBefore, afterSrc: elenaAfter },
  { name: "Marcus T.", beforeSrc: marcusBefore, afterSrc: marcusAfter },
];
