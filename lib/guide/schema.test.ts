import { describe, it, expect } from "vitest";
import { GuideDocSchema, AnswersSchema } from "@/lib/guide/schema";

const validGuide = {
  title: "The Second Wind Protocol",
  intro: "A plan built from your scan.",
  goalFocus: "Lose body fat",
  weeks: Array.from({ length: 8 }, (_, i) => ({
    week: i + 1,
    focus: `Week ${i + 1} focus`,
    sessions: ["Session A"],
    note: "Keep it simple.",
  })),
  nutritionReset: { summary: "Eat real food.", eatList: ["Vegetables"], rhythm: ["Three meals"] },
  sleepStress: { summary: "Sleep more.", practices: ["Fixed bedtime"] },
  dailyTenMinute: { summary: "Ten minutes.", movements: ["Squats"] },
  recalibration: "Tighten weekly.",
  outcomes: ["Lose around 5 kg of body fat"],
};

describe("GuideDocSchema", () => {
  it("accepts a well-formed guide", () => {
    expect(() => GuideDocSchema.parse(validGuide)).not.toThrow();
  });

  it("rejects a guide that does not have exactly 8 weeks", () => {
    const bad = { ...validGuide, weeks: validGuide.weeks.slice(0, 6) };
    expect(() => GuideDocSchema.parse(bad)).toThrow();
  });

  it("rejects a guide missing a required section", () => {
    const { nutritionReset, ...bad } = validGuide;
    void nutritionReset;
    expect(() => GuideDocSchema.parse(bad)).toThrow();
  });
});

describe("AnswersSchema", () => {
  it("accepts answers that include age", () => {
    expect(() => AnswersSchema.parse({ age: 35, smoking: "never" })).not.toThrow();
  });
  it("rejects answers without age", () => {
    expect(() => AnswersSchema.parse({ smoking: "never" })).toThrow();
  });
});
