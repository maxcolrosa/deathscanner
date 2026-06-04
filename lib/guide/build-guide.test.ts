import { describe, it, expect } from "vitest";
import { computeResult } from "@/lib/longevity";
import { GuideDocSchema } from "@/lib/guide/schema";
import { buildGuide } from "@/lib/guide/build-guide";

const sedentary = { age: 45, sex: "male", smoking: "heavy", bodycomp: "over", activity: "none", activity_barrier: "time", diet: "poor", alcohol: "moderate", sleep: "low", stress: "high", genetics: "mixed", goal: "fat" };
const active = { age: 30, sex: "female", smoking: "never", bodycomp: "lean", activity: "high", diet: "excellent", alcohol: "none", sleep: "optimal", stress: "low", genetics: "strong", goal: "strength" };
const injured = { ...sedentary, activity: "light", activity_barrier: "injury" };

describe("buildGuide", () => {
  it("produces a schema-valid guide for varied profiles", () => {
    for (const a of [sedentary, active, injured]) {
      expect(() => GuideDocSchema.parse(buildGuide(computeResult(a), a))).not.toThrow();
    }
  });

  it("is deterministic for the same inputs", () => {
    expect(buildGuide(computeResult(sedentary), sedentary)).toEqual(
      buildGuide(computeResult(sedentary), sedentary)
    );
  });

  it("top risk category appears in the guide narrative, not the week grid", () => {
    const r = computeResult(sedentary);
    const guide = buildGuide(r, sedentary);
    const topRisk = r.topRisks[0].category.toLowerCase();
    // Risk personalization lives in yourSituation and strategy, not the weekly focus.
    expect(
      guide.yourSituation.toLowerCase() + guide.strategy.toLowerCase()
    ).toContain(topRisk);
    // Week 1 focus reflects the Foundation phase, not a risk category.
    expect(guide.weeks[0].focus.toLowerCase()).toContain("foundation");
  });

  it("scales training volume to activity (sedentary fewer days than very active)", () => {
    const s = buildGuide(computeResult(sedentary), sedentary).training.workouts.length;
    const a = buildGuide(computeResult(active), active).training.workouts.length;
    expect(a).toBeGreaterThan(s);
  });

  it("uses low-impact variants and names the injury when injury is the barrier", () => {
    const g = buildGuide(computeResult(injured), injured);
    const names = g.training.workouts.flatMap((w) => w.exercises.map((e) => e.name.toLowerCase())).join(" ");
    expect(names).toMatch(/box squat|glute bridge|incline|band/);
    expect(g.yourSituation.toLowerCase()).toContain("injury");
  });

  it("gives a poor diet more swaps than an excellent diet", () => {
    const poor = buildGuide(computeResult(sedentary), sedentary).nutritionPlan.swaps.length;
    const good = buildGuide(computeResult(active), active).nutritionPlan.swaps.length;
    expect(poor).toBeGreaterThan(good);
  });

  it("yourNumbers has at least 4 metrics", () => {
    for (const a of [sedentary, active, injured]) {
      const guide = buildGuide(computeResult(a), a);
      expect(guide.yourNumbers.metrics.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("yourNumbers.reclaimedYearsHeadline references recoverableYears when > 0", () => {
    const result = computeResult(sedentary);
    const guide = buildGuide(result, sedentary);
    if (result.recoverableYears > 0) {
      const rounded = String(Math.round((Math.round(result.recoverableYears * 10) / 10)));
      expect(guide.yourNumbers.reclaimedYearsHeadline).toContain(rounded);
    } else {
      expect(guide.yourNumbers.reclaimedYearsHeadline.length).toBeGreaterThan(0);
    }
  });

  it("bonusModules has exactly 4 entries with the expected headings", () => {
    const guide = buildGuide(computeResult(sedentary), sedentary);
    expect(guide.bonusModules).toHaveLength(4);
    const headings = guide.bonusModules.map((m) => m.heading);
    expect(headings).toContain("The Plateau Protocol");
    expect(headings).toContain("Travel and Holiday Survival Kit");
    expect(headings).toContain("The Supplement Truth");
    expect(headings).toContain("Your Next 8 Weeks");
  });

  it("trackers.groceryByAisle is non-empty", () => {
    for (const a of [sedentary, active, injured]) {
      const guide = buildGuide(computeResult(a), a);
      expect(guide.trackers.groceryByAisle.length).toBeGreaterThan(0);
      // Every aisle must have at least one item.
      for (const aisleEntry of guide.trackers.groceryByAisle) {
        expect(aisleEntry.items.length).toBeGreaterThan(0);
      }
    }
  });

  it("trackers.dailyChecklist has at least 3 items", () => {
    for (const a of [sedentary, active, injured]) {
      const guide = buildGuide(computeResult(a), a);
      expect(guide.trackers.dailyChecklist.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("two builds with identical inputs produce deeply equal output", () => {
    for (const a of [sedentary, active, injured]) {
      const r = computeResult(a);
      expect(buildGuide(r, a)).toEqual(buildGuide(r, a));
    }
  });
});
