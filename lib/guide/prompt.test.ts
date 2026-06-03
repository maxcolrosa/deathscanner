import { describe, it, expect } from "vitest";
import { computeResult } from "@/lib/longevity";
import { buildGuidePrompt } from "@/lib/guide/prompt";

const answers = {
  age: 45,
  sex: "male",
  smoking: "heavy",
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

describe("buildGuidePrompt", () => {
  const { system, user } = buildGuidePrompt(computeResult(answers), answers);

  it("system prompt states the structure, specificity mandate, and no-em-dash rule", () => {
    expect(system).toMatch(/8-week/i);
    expect(system).toMatch(/em-dash/i);
    expect(system).toMatch(/emit_guide/i);
    expect(system).toMatch(/sets|reps/i);
    expect(system).toMatch(/specific|prescriptive|exactly/i);
  });

  it("user prompt carries the personalization signals", () => {
    expect(user).toMatch(/tobacco/i); // top risk category
    expect(user).toMatch(/fat/i); // goal
    expect(user).toMatch(/time/i); // activity_barrier label
  });
});
