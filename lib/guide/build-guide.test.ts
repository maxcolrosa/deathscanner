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
    // sedentary fixture: recoverableYears = 14.1, rounds to 14
    const result = computeResult(sedentary);
    const guide = buildGuide(result, sedentary);
    // Hardcoded expected value - if the engine changes and this breaks, the test
    // will catch it (unlike a formula that mirrors the implementation).
    expect(result.recoverableYears).toBeGreaterThan(0);
    expect(guide.yourNumbers.reclaimedYearsHeadline).toContain("14");
  });

  it("yourNumbers.reclaimedYearsHeadline has a sensible fallback when no recoverable years", () => {
    // The fallback branch produces a specific coaching string; assert its content.
    // We synthesize a result with recoverableYears === 0 by patching the object.
    const result = { ...computeResult(sedentary), recoverableYears: 0 };
    const guide = buildGuide(result, sedentary);
    expect(guide.yourNumbers.reclaimedYearsHeadline).toContain("numbers that show the plan is working");
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

  // ─── Recipe bank (Layer A) ───────────────────────────────────────────────

  it("recipeBank has at least 12 recipes spanning all four meal types", () => {
    for (const a of [sedentary, active, injured]) {
      const guide = buildGuide(computeResult(a), a);
      const { recipes } = guide.recipeBank;
      expect(recipes.length).toBeGreaterThanOrEqual(12);
      const mealTypes = new Set(recipes.map((r) => r.meal));
      expect(mealTypes.has("breakfast")).toBe(true);
      expect(mealTypes.has("lunch")).toBe(true);
      expect(mealTypes.has("dinner")).toBe(true);
      expect(mealTypes.has("snack")).toBe(true);
    }
  });

  it("recipeBank: fat goal yields lower average calories than strength goal", () => {
    const fatAnswers = { ...sedentary, goal: "fat" };
    const strengthAnswers = { ...sedentary, goal: "strength" };
    const fatGuide = buildGuide(computeResult(fatAnswers), fatAnswers);
    const strengthGuide = buildGuide(computeResult(strengthAnswers), strengthAnswers);
    const avg = (recipes: { calories: number }[]) =>
      recipes.reduce((sum, r) => sum + r.calories, 0) / recipes.length;
    expect(avg(fatGuide.recipeBank.recipes)).toBeLessThan(avg(strengthGuide.recipeBank.recipes));
  });

  it("recipeBank always contains at least one vegetarian or plant-protein recipe", () => {
    for (const a of [sedentary, active, injured]) {
      const guide = buildGuide(computeResult(a), a);
      const hasVeg = guide.recipeBank.recipes.some(
        (r) => r.tags.includes("vegetarian") || r.tags.includes("plant-protein")
      );
      expect(hasVeg).toBe(true);
    }
  });

  it("recipeBank shoppingList is non-empty and contains aisle-grouped items", () => {
    for (const a of [sedentary, active, injured]) {
      const guide = buildGuide(computeResult(a), a);
      const { shoppingList } = guide.recipeBank;
      expect(shoppingList.length).toBeGreaterThan(0);
      for (const aisleEntry of shoppingList) {
        expect(aisleEntry.aisle.length).toBeGreaterThan(0);
        expect(aisleEntry.items.length).toBeGreaterThan(0);
      }
    }
  });

  it("recipeBank is deterministic for fixed inputs (deep-equal on two builds)", () => {
    for (const a of [sedentary, active, injured]) {
      const r = computeResult(a);
      const g1 = buildGuide(r, a).recipeBank;
      const g2 = buildGuide(r, a).recipeBank;
      expect(g1).toEqual(g2);
    }
  });
});
