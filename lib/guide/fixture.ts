import type { ScanResult } from "@/lib/longevity";
import { PRODUCT } from "@/lib/product";
import type { GuideDoc, GuideWeek } from "@/lib/guide/schema";

// Deterministic, offline guide derived from the scan result. Used as the stub
// generator (no API key) and in tests. Mirrors the GuideDoc contract so the
// rest of the pipeline is exercised without a network call.
export function buildFixtureGuide(result: ScanResult): GuideDoc {
  const risks = result.topRisks.length
    ? result.topRisks.map((r) => r.category)
    : ["Physical activity", "Diet quality", "Sleep"];
  const goalFocus = result.outcomes[0]?.label ?? "Add years back to your life";

  const weeks: GuideWeek[] = Array.from({ length: 8 }, (_, i) => {
    const target = risks[i % risks.length];
    return {
      week: i + 1,
      focus: `Week ${i + 1}: ${target}`,
      sessions: [
        `Primary work on ${target.toLowerCase()}`,
        "A short conditioning finisher",
      ],
      note: `Hold the change from week ${Math.max(1, i)} while you add this one.`,
    };
  });

  return {
    title: PRODUCT.name,
    intro: `This plan is built from your scan. It leads with ${risks[0].toLowerCase()}, the biggest drag on your projection, then works down your list in order of impact.`,
    goalFocus,
    weeks,
    nutritionReset: {
      summary: "No counting. A short list of foods and a daily rhythm you can repeat.",
      eatList: ["Protein at every meal", "Vegetables you actually like", "Whole-food carbs around training"],
      rhythm: ["Three meals, no grazing", "Stop eating 3 hours before bed"],
    },
    sleepStress: {
      summary: "Get your nights and your nervous system back first; everything else gets easier.",
      practices: ["A fixed wake time, 7 days a week", "Ten minutes of wind-down with no screens", "One daily walk outside"],
    },
    dailyTenMinute: {
      summary: "Short enough that 'no time' stops being the reason.",
      movements: ["2 minutes easy mobility", "6 minutes of strength work", "2 minutes of breathing"],
    },
    recalibration: "Each week the plan tightens as your numbers move. Repeat what worked, replace what did not.",
    outcomes: result.outcomes.map((o) => o.label),
  };
}
