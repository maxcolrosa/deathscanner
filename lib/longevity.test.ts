import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  computeResult,
  BASE_LIFE_EXPECTANCY,
  MAX_LIFE_EXPECTANCY,
  type Answers,
} from "@/lib/longevity";

const FIXED_TODAY = new Date("2026-06-03T00:00:00.000Z");

// Build answers by picking an option index for each choice question.
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

// Pick the worst (most negative) or best (most positive) option per question.
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

  it("every choice question has at least 2 options, each with a clinical detail", () => {
    for (const q of QUESTIONS) {
      if (q.kind === "choice") {
        expect(q.options!.length).toBeGreaterThanOrEqual(2);
        expect(q.category.length).toBeGreaterThan(0);
        for (const opt of q.options!) {
          expect(opt.detail.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("includes at least one non-recoverable factor (so recoverable filtering is meaningful)", () => {
    const nonRecoverable = QUESTIONS.filter(
      (q) => q.kind === "choice" && !q.recoverable
    );
    expect(nonRecoverable.length).toBeGreaterThanOrEqual(1);
  });

  it("marks biological sex as non-recoverable", () => {
    const sex = QUESTIONS.find((q) => q.id === "sex");
    expect(sex).toBeDefined();
    expect(sex!.recoverable).toBe(false);
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

  it("exposes the national baseline it starts from", () => {
    const result = computeResult(buildAnswers(35, 0), FIXED_TODAY);
    expect(result.baseLifeExpectancy).toBe(BASE_LIFE_EXPECTANCY);
  });

  it("best-case answers push life expectancy up and recoverableYears to 0", () => {
    const result = computeResult(buildExtreme(30, "best"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeGreaterThan(BASE_LIFE_EXPECTANCY);
    expect(result.lifeExpectancy).toBeLessThanOrEqual(MAX_LIFE_EXPECTANCY);
    expect(result.recoverableYears).toBe(0);
    expect(result.topRecoverable).toHaveLength(0);
  });

  it("worst-case answers lower life expectancy and produce positive recoverableYears", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeLessThan(BASE_LIFE_EXPECTANCY);
    expect(result.recoverableYears).toBeGreaterThan(0);
  });

  it("supports fractional (decimal) life-expectancy estimates", () => {
    // The realistic model uses decimal weights, so the estimate is rarely an integer.
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    expect(Number.isInteger(result.lifeExpectancy)).toBe(false);
  });

  it("clamps life expectancy to at least currentAge and projects a future date", () => {
    const result = computeResult(buildExtreme(99, "worst"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeGreaterThanOrEqual(99);
    expect(result.predictedDeathDate.getTime()).toBeGreaterThan(
      FIXED_TODAY.getTime()
    );
  });

  it("projects the death date roughly (lifeExpectancy - age) years out", () => {
    const result = computeResult(buildAnswers(40, 1), FIXED_TODAY);
    const yearsOut =
      result.predictedDeathDate.getFullYear() - FIXED_TODAY.getFullYear();
    const expected = result.lifeExpectancy - 40;
    // Month rounding can shift the calendar year by up to 1.
    expect(Math.abs(yearsOut - expected)).toBeLessThanOrEqual(1);
  });

  it("recoverableYears only counts losses from recoverable factors", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    const recoverableLoss = result.factors
      .filter((f) => f.recoverable && f.deltaYears < 0)
      .reduce((sum, f) => sum - f.deltaYears, 0);
    expect(result.recoverableYears).toBeCloseTo(recoverableLoss, 5);
    // Non-recoverable losses (e.g. sex, family history) must be excluded.
    const nonRecoverableLoss = result.factors
      .filter((f) => !f.recoverable && f.deltaYears < 0)
      .reduce((sum, f) => sum - f.deltaYears, 0);
    expect(nonRecoverableLoss).toBeGreaterThan(0);
    expect(result.recoverableYears).toBeLessThan(
      recoverableLoss + nonRecoverableLoss
    );
  });

  it("topRecoverable lists the biggest reversible losses, worst first, max 3", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    expect(result.topRecoverable.length).toBeGreaterThan(0);
    expect(result.topRecoverable.length).toBeLessThanOrEqual(3);
    for (const f of result.topRecoverable) {
      expect(f.recoverable).toBe(true);
      expect(f.deltaYears).toBeLessThan(0);
    }
    // Sorted ascending (most negative first).
    for (let i = 1; i < result.topRecoverable.length; i++) {
      expect(result.topRecoverable[i - 1].deltaYears).toBeLessThanOrEqual(
        result.topRecoverable[i].deltaYears
      );
    }
  });

  it("returns one factor per choice question, each with category and detail", () => {
    const choiceCount = QUESTIONS.filter((q) => q.kind === "choice").length;
    const result = computeResult(buildAnswers(35, 0), FIXED_TODAY);
    expect(result.factors).toHaveLength(choiceCount);
    for (const f of result.factors) {
      expect(f.category.length).toBeGreaterThan(0);
      expect(f.detail.length).toBeGreaterThan(0);
      expect(f.answerLabel.length).toBeGreaterThan(0);
    }
  });
});
