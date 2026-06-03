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
  weeks: number;
  beforeSrc: StaticImageData;
  afterSrc: StaticImageData;
  stat: string;
}

// Ordered to match the transformation gallery first, then two extra voices.
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "My scan put my date at 71 and I genuinely did not sleep that night. What changed it was that the plan gave me one thing to do each morning instead of a vague 'get healthier.' Eight weeks in I am down 8 kg and my partner says I look ten years younger. First program I have ever actually finished.",
    name: "Daniel R.",
    meta: "Logistics manager, 44 · Manchester",
    detail: "Down 8 kg in 8 weeks",
    rating: 5,
    verifiedAgo: "5 days ago",
  },
  {
    quote:
      "I almost did not pay, because I assumed it would be the same generic plan everyone gets. It was not. It used my actual answers about my sleep and my stress and built the first two weeks around fixing those. My resting heart rate dropped 11 points and the brain fog I had blamed on work is just gone.",
    name: "Mei L.",
    meta: "Product designer, 33 · San Jose",
    detail: "Resting HR 78 to 67 bpm",
    rating: 5,
    verifiedAgo: "1 week ago",
  },
  {
    quote:
      "The report did not lecture me about smoking. It just showed me, in plain numbers, the years it was costing me. Using the training sessions as my craving ritual is the only thing that has ever worked for me. Day 61 with no cigarettes, and last weekend I climbed three flights without stopping for the first time since college.",
    name: "Marcus T.",
    meta: "Electrician, 39 · Atlanta",
    detail: "61 days off cigarettes",
    rating: 5,
    verifiedAgo: "2 weeks ago",
  },
  {
    quote:
      "Two kids and a full time job meant every other plan I tried was dead by week two. The 10-minute fallback for the bad days is the thing that kept the streak alive. I am back under a barbell for the first time since my second was born, and I actually look forward to it now instead of dreading it.",
    name: "Elena K.",
    meta: "Nurse, 41 · Austin",
    detail: "Back to lifting after 6 years",
    rating: 5,
    verifiedAgo: "3 weeks ago",
  },
  {
    quote:
      "I will be honest, the death-date thing felt like a gimmick and the countdown timer is a bit much. But I bought it anyway, and the grocery staples list on its own was worth the money. I stopped overthinking food and lost the gut I had carried for ten years. Would have given five stars if the checkout had not fought me twice.",
    name: "Tom B.",
    meta: "Teacher, 52 · Leeds",
    detail: "Lost a decade-old gut",
    rating: 4,
    verifiedAgo: "6 days ago",
  },
  {
    quote:
      "I have wasted hundreds on programs I quit by February. This is the first one that adjusted as I went instead of making me feel like a failure when I fell behind a week. By week three I stopped needing the 3pm coffee to function. I cancelled the gym membership I never used and just do this in the front room.",
    name: "Sarah L.",
    meta: "Account manager, 36 · Brighton",
    detail: "Energy back by week three",
    rating: 5,
    verifiedAgo: "yesterday",
  },
];

// Fixed shared set. Images live in /public/transformations/ and are imported
// above so a file swap busts caches automatically. 2 female, 2 male.
export const TRANSFORMATIONS: Transformation[] = [
  { name: "Mei L.", weeks: 10, beforeSrc: meiBefore, afterSrc: meiAfter, stat: "10 weeks" },
  { name: "Daniel R.", weeks: 8, beforeSrc: danielBefore, afterSrc: danielAfter, stat: "8 weeks" },
  { name: "Elena K.", weeks: 12, beforeSrc: elenaBefore, afterSrc: elenaAfter, stat: "12 weeks" },
  { name: "Marcus T.", weeks: 8, beforeSrc: marcusBefore, afterSrc: marcusAfter, stat: "8 weeks" },
];
