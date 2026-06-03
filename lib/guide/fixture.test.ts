import { describe, it, expect } from "vitest";
import { computeResult } from "@/lib/longevity";
import { GuideDocSchema } from "@/lib/guide/schema";
import { buildFixtureGuide } from "@/lib/guide/fixture";

const answers = {
  age: 45,
  sex: "male",
  smoking: "heavy",
  smoking_years: "over15",
  bodycomp: "over",
  activity: "none",
  activity_barrier: "time",
  diet: "poor",
  alcohol: "moderate",
  sleep: "low",
  stress: "high",
  genetics: "mixed",
  goal: "fat",
};

describe("buildFixtureGuide", () => {
  it("produces a schema-valid guide", () => {
    const guide = buildFixtureGuide(computeResult(answers));
    expect(() => GuideDocSchema.parse(guide)).not.toThrow();
  });

  it("is deterministic for the same result", () => {
    const a = buildFixtureGuide(computeResult(answers));
    const b = buildFixtureGuide(computeResult(answers));
    expect(a).toEqual(b);
  });

  it("leads week 1 with the top risk category", () => {
    const result = computeResult(answers);
    const guide = buildFixtureGuide(result);
    expect(guide.weeks[0].focus.toLowerCase()).toContain(
      result.topRisks[0].category.toLowerCase()
    );
  });
});
