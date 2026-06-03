import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  computeResult,
  BASE_LIFE_EXPECTANCY,
  MAX_LIFE_EXPECTANCY,
  type Answers,
} from "@/lib/longevity";

const FIXED_TODAY = new Date("2026-06-03T00:00:00.000Z");

// Helper: build an answers object by picking an option index for each choice
// question and a given age.
function buildAnswers(age: number, optionIndex: number): Answers {
  const answers: Answers = {};
  for (const q of QUESTIONS) {
    if (q.kind === "age") {
      answers[q.id] = age;
    } else {
      const opts = q.options!;
      const idx = Math.min(optionIndex, opts.length - 1);
      answers[q.id] = opts[idx].value;
    }
  }
  return answers;
}

// Pick the worst (most negative) and best (most positive) option per question.
function buildExtreme(age: number, kind: "worst" | "best"): Answers {
  const answers: Answers = {};
  for (const q of QUESTIONS) {
    if (q.kind === "age") {
      answers[q.id] = age;
      continue;
    }
    const opts = [...q.options!].sort((a, b) => a.yearsDelta - b.yearsDelta);
    answers[q.id] = (kind === "worst" ? opts[0] : opts[opts.length - 1]).value;
  }
  return answers;
}

describe("QUESTIONS config", () => {
  it("has exactly one age question, placed first", () => {
    const ageQuestions = QUESTIONS.filter((q) => q.kind === "age");
    expect(ageQuestions).toHaveLength(1);
    expect(QUESTIONS[0].kind).toBe("age");
  });

  it("every choice question has at least 2 options", () => {
    for (const q of QUESTIONS) {
      if (q.kind === "choice") {
        expect(q.options!.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("includes at least one non-recoverable factor (so recoverable filtering is meaningful)", () => {
    const nonRecoverable = QUESTIONS.filter(
      (q) => q.kind === "choice" && !q.recoverable
    );
    expect(nonRecoverable.length).toBeGreaterThanOrEqual(1);
  });
});

describe("computeResult", () => {
  it("is deterministic for the same answers and injected today", () => {
    const answers = buildExtreme(30, "worst");
    const a = computeResult(answers, FIXED_TODAY);
    const b = computeResult(answers, FIXED_TODAY);
    expect(a.lifeExpectancy).toBe(b.lifeExpectancy);
    expect(a.predictedDeathDate.getTime()).toBe(b.predictedDeathDate.getTime());
    expect(a.recoverableYears).toBe(b.recoverableYears);
  });

  it("best-case answers push life expectancy up and recoverableYears to 0", () => {
    const result = computeResult(buildExtreme(30, "best"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeGreaterThan(BASE_LIFE_EXPECTANCY);
    expect(result.lifeExpectancy).toBeLessThanOrEqual(MAX_LIFE_EXPECTANCY);
    expect(result.recoverableYears).toBe(0);
  });

  it("worst-case answers lower life expectancy and produce positive recoverableYears", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeLessThan(BASE_LIFE_EXPECTANCY);
    expect(result.recoverableYears).toBeGreaterThan(0);
  });

  it("clamps life expectancy to at least currentAge + 1", () => {
    // A 100-year-old with the worst lifestyle would otherwise score below 100.
    const result = computeResult(buildExtreme(100, "worst"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeGreaterThanOrEqual(101);
    expect(result.predictedDeathDate.getFullYear()).toBeGreaterThan(2026);
  });

  it("computes the death date as today plus (lifeExpectancy - age) years", () => {
    const answers = buildAnswers(40, 1);
    const result = computeResult(answers, FIXED_TODAY);
    const expectedYear =
      FIXED_TODAY.getFullYear() + (result.lifeExpectancy - 40);
    expect(result.predictedDeathDate.getFullYear()).toBe(expectedYear);
  });

  it("recoverableYears only counts losses from recoverable factors", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    const recoverableLoss = result.factors
      .filter((f) => f.recoverable && f.deltaYears < 0)
      .reduce((sum, f) => sum - f.deltaYears, 0);
    expect(result.recoverableYears).toBe(recoverableLoss);
    // A non-recoverable negative factor must NOT be included.
    const nonRecoverableLoss = result.factors
      .filter((f) => !f.recoverable && f.deltaYears < 0)
      .reduce((sum, f) => sum - f.deltaYears, 0);
    expect(nonRecoverableLoss).toBeGreaterThan(0);
    expect(result.recoverableYears).toBeLessThan(
      recoverableLoss + nonRecoverableLoss
    );
  });

  it("returns one factor per choice question", () => {
    const choiceCount = QUESTIONS.filter((q) => q.kind === "choice").length;
    const result = computeResult(buildAnswers(35, 0), FIXED_TODAY);
    expect(result.factors).toHaveLength(choiceCount);
  });
});
