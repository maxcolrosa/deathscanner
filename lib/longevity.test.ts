import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  computeResult,
  getActiveQuestions,
  BASE_LIFE_EXPECTANCY,
  MAX_LIFE_EXPECTANCY,
  type Answers,
} from "@/lib/longevity";

const FIXED_TODAY = new Date("2026-06-03T00:00:00.000Z");

function isScored(id: string): boolean {
  return QUESTIONS.find((q) => q.id === id)!.scored !== false;
}

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

// Expected number of scored, active choice questions for a given answer set.
function expectedFactorCount(answers: Answers): number {
  return getActiveQuestions(answers).filter(
    (q) => q.kind === "choice" && q.scored !== false
  ).length;
}

describe("QUESTIONS config", () => {
  it("has exactly one age question, placed first", () => {
    const ageQuestions = QUESTIONS.filter((q) => q.kind === "age");
    expect(ageQuestions).toHaveLength(1);
    expect(QUESTIONS[0].kind).toBe("age");
  });

  it("every choice option has a non-empty label and clinical detail", () => {
    for (const q of QUESTIONS) {
      if (q.kind === "choice") {
        expect(q.options!.length).toBeGreaterThanOrEqual(2);
        expect(q.category.length).toBeGreaterThan(0);
        for (const opt of q.options!) {
          expect(opt.label.length).toBeGreaterThan(0);
          expect(opt.detail.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("includes at least one non-recoverable factor and one unscored question", () => {
    expect(
      QUESTIONS.filter((q) => q.kind === "choice" && !q.recoverable).length
    ).toBeGreaterThanOrEqual(1);
    expect(QUESTIONS.filter((q) => q.scored === false).length).toBeGreaterThanOrEqual(1);
  });
});

describe("getActiveQuestions (branching)", () => {
  it("hides the tobacco-exposure follow-up for non-smokers", () => {
    const ids = getActiveQuestions({ smoking: "never" }).map((q) => q.id);
    expect(ids).not.toContain("smoking_years");
  });

  it("shows the tobacco-exposure follow-up once tobacco use is reported", () => {
    const ids = getActiveQuestions({ smoking: "heavy" }).map((q) => q.id);
    expect(ids).toContain("smoking_years");
  });

  it("shows the training-barrier follow-up only for low activity", () => {
    expect(getActiveQuestions({ activity: "none" }).map((q) => q.id)).toContain(
      "activity_barrier"
    );
    expect(getActiveQuestions({ activity: "high" }).map((q) => q.id)).not.toContain(
      "activity_barrier"
    );
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

  it("ignores unscored questions (goal) in the estimate", () => {
    const withGoalA = { ...buildAnswers(35, 1), goal: "fat" };
    const withGoalB = { ...buildAnswers(35, 1), goal: "heart" };
    expect(computeResult(withGoalA, FIXED_TODAY).lifeExpectancy).toBe(
      computeResult(withGoalB, FIXED_TODAY).lifeExpectancy
    );
  });

  it("best-case answers push life expectancy up and recoverableYears to 0", () => {
    const result = computeResult(buildExtreme(30, "best"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeGreaterThan(BASE_LIFE_EXPECTANCY);
    expect(result.lifeExpectancy).toBeLessThanOrEqual(MAX_LIFE_EXPECTANCY);
    expect(result.recoverableYears).toBe(0);
    expect(result.topRisks).toHaveLength(0);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it("worst-case answers lower life expectancy and produce positive recoverableYears", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeLessThan(BASE_LIFE_EXPECTANCY);
    expect(result.recoverableYears).toBeGreaterThan(0);
  });

  it("supports fractional (decimal) life-expectancy estimates", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    expect(Number.isInteger(result.lifeExpectancy)).toBe(false);
  });

  it("clamps life expectancy to at least currentAge and projects a future date", () => {
    const result = computeResult(buildExtreme(99, "worst"), FIXED_TODAY);
    expect(result.lifeExpectancy).toBeGreaterThanOrEqual(99);
    expect(result.predictedDeathDate.getTime()).toBeGreaterThan(FIXED_TODAY.getTime());
  });

  it("projects the death date roughly (lifeExpectancy - age) years out", () => {
    const result = computeResult(buildAnswers(40, 1), FIXED_TODAY);
    const yearsOut =
      result.predictedDeathDate.getFullYear() - FIXED_TODAY.getFullYear();
    expect(Math.abs(yearsOut - (result.lifeExpectancy - 40))).toBeLessThanOrEqual(1);
  });

  it("recoverableYears only counts losses from recoverable factors", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    const recoverableLoss = result.factors
      .filter((f) => f.recoverable && f.deltaYears < 0)
      .reduce((sum, f) => sum - f.deltaYears, 0);
    expect(result.recoverableYears).toBeCloseTo(recoverableLoss, 5);
    const nonRecoverableLoss = result.factors
      .filter((f) => !f.recoverable && f.deltaYears < 0)
      .reduce((sum, f) => sum - f.deltaYears, 0);
    expect(nonRecoverableLoss).toBeGreaterThan(0);
    expect(result.recoverableYears).toBeLessThan(recoverableLoss + nonRecoverableLoss);
  });

  it("topRisks lists the biggest reversible losses, worst first, max 3", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    expect(result.topRisks.length).toBeGreaterThan(0);
    expect(result.topRisks.length).toBeLessThanOrEqual(3);
    for (const f of result.topRisks) {
      expect(f.recoverable).toBe(true);
      expect(f.deltaYears).toBeLessThan(0);
    }
    for (let i = 1; i < result.topRisks.length; i++) {
      expect(result.topRisks[i - 1].deltaYears).toBeLessThanOrEqual(
        result.topRisks[i].deltaYears
      );
    }
  });

  it("classifies factor impact by magnitude", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    const smoking = result.factors.find((f) => f.id === "smoking");
    expect(smoking?.impact).toBe("high"); // heavy smoking, |delta| >= 3
  });

  it("derives concrete, results-based outcomes (max 4)", () => {
    const result = computeResult(buildExtreme(30, "worst"), FIXED_TODAY);
    expect(result.outcomes.length).toBeGreaterThan(0);
    expect(result.outcomes.length).toBeLessThanOrEqual(4);
    for (const o of result.outcomes) {
      expect(o.label.length).toBeGreaterThan(0);
    }
  });

  it("ranks a goal-aligned outcome first", () => {
    // A heavy/obese profile whose stated goal is fat loss should lead with fat loss.
    const answers = { ...buildAnswers(35, 0), bodycomp: "obese", goal: "fat" };
    const result = computeResult(answers, FIXED_TODAY);
    expect(result.outcomes[0].id).toBe("fat");
    expect(result.primaryGoal).toBe("fat");
  });

  it("returns one factor per scored, active choice question", () => {
    const answers = buildAnswers(35, 0);
    const result = computeResult(answers, FIXED_TODAY);
    expect(result.factors).toHaveLength(expectedFactorCount(answers));
    for (const f of result.factors) {
      expect(f.category.length).toBeGreaterThan(0);
      expect(f.detail.length).toBeGreaterThan(0);
    }
    // The unscored goal question is never a factor.
    expect(result.factors.find((f) => f.id === "goal")).toBeUndefined();
    expect(isScored("goal")).toBe(false);
  });
});
