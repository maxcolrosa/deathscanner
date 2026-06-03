export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

export interface Transformation {
  weeks: number;
  caption: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { quote: "I stopped dreading mornings. The plan was short enough that I actually did it.", name: "Daniel R.", detail: "Down 7 kg in 8 weeks" },
  { quote: "My scan scared me. This gave me something to do about it.", name: "Priya M.", detail: "Resting heart rate down 11 bpm" },
  { quote: "First program I have ever finished. The weekly recalibration kept it honest.", name: "Marcus T.", detail: "Sleeping a full hour longer" },
  { quote: "The 10-minute routine fit a life with two kids and a job.", name: "Elena K.", detail: "Back to lifting after years off" },
];

// Placeholder transformation slots. Real before/after assets are dropped in
// later (drop images into /public and render them in place of the slots).
export const TRANSFORMATIONS: Transformation[] = [
  { weeks: 8, caption: "8-week transformation" },
  { weeks: 12, caption: "12-week transformation" },
  { weeks: 8, caption: "8-week transformation" },
];
