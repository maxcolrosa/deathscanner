export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

export interface Transformation {
  name: string;
  weeks: number;
  beforeSrc: string;
  afterSrc: string;
  stat: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { quote: "I stopped dreading mornings. The plan was short enough that I actually did it.", name: "Daniel R.", detail: "Down 7 kg in 8 weeks" },
  { quote: "My scan scared me. This gave me something to do about it, step by step.", name: "Priya M.", detail: "Resting heart rate down 11 bpm" },
  { quote: "First program I have ever finished. The weekly recalibration kept it honest.", name: "Marcus T.", detail: "Sleeping a full hour longer" },
  { quote: "The 10-minute fallback fit a life with two kids and a job. No more all-or-nothing.", name: "Elena K.", detail: "Back to lifting after years off" },
  { quote: "The grocery list and sample day took all the guesswork out of eating.", name: "Tom B.", detail: "Lost the gut he had for a decade" },
  { quote: "It felt like it was written for me, because it was. It used my actual answers.", name: "Sarah L.", detail: "Energy back by week three" },
];

// Fixed shared set. The image files are generated into /public/transformations/
// at build time (see Plan 2, Task 7). 2 female, 2 male.
export const TRANSFORMATIONS: Transformation[] = [
  { name: "Priya M.", weeks: 10, beforeSrc: "/transformations/priya-before.jpg", afterSrc: "/transformations/priya-after.jpg", stat: "10 weeks" },
  { name: "Daniel R.", weeks: 8, beforeSrc: "/transformations/daniel-before.jpg", afterSrc: "/transformations/daniel-after.jpg", stat: "8 weeks" },
  { name: "Elena K.", weeks: 12, beforeSrc: "/transformations/elena-before.jpg", afterSrc: "/transformations/elena-after.jpg", stat: "12 weeks" },
  { name: "Marcus T.", weeks: 8, beforeSrc: "/transformations/marcus-before.jpg", afterSrc: "/transformations/marcus-after.jpg", stat: "8 weeks" },
];
