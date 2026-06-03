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

  it("leads week 1 with the top risk category", () => {
    const r = computeResult(sedentary);
    expect(buildGuide(r, sedentary).weeks[0].focus.toLowerCase()).toContain(
      r.topRisks[0].category.toLowerCase()
    );
  });

  it("scales training volume to activity (sedentary fewer days than very active)", () => {
    const s = buildGuide(computeResult(sedentary), sedentary).weeks[0].workouts.length;
    const a = buildGuide(computeResult(active), active).weeks[0].workouts.length;
    expect(a).toBeGreaterThan(s);
  });

  it("uses low-impact variants and names the injury when injury is the barrier", () => {
    const g = buildGuide(computeResult(injured), injured);
    const names = g.weeks[0].workouts.flatMap((w) => w.exercises.map((e) => e.name.toLowerCase())).join(" ");
    expect(names).toMatch(/box squat|glute bridge|incline|band/);
    expect(g.yourSituation.toLowerCase()).toContain("injury");
  });

  it("gives a poor diet more swaps than an excellent diet", () => {
    const poor = buildGuide(computeResult(sedentary), sedentary).nutritionPlan.swaps.length;
    const good = buildGuide(computeResult(active), active).nutritionPlan.swaps.length;
    expect(poor).toBeGreaterThan(good);
  });
});
