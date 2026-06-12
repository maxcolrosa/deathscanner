import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeResult, type Answers } from "@/lib/longevity";
import {
  DEEPSCAN_QUESTIONS,
  getDeepscanQuestions,
  validateDeepscanAnswers,
} from "@/lib/deepscan/questions";
import { buildDeepscanFallback } from "@/lib/deepscan/fallback";
import { runDeepscan, DEEPSCAN_FALLBACK_MODEL } from "@/lib/deepscan/run";
import { DeepscanReportSchema } from "@/lib/deepscan/schema";
import { runDeepscanAction } from "@/lib/deepscan/actions";
import { createOrder, markReady, __clearMemory } from "@/lib/guide/orders";
import { buildGuide } from "@/lib/guide/build-guide";

const MALE_ANSWERS: Answers = {
  age: 42,
  sex: "male",
  bodycomp: "over",
  activity: "light",
  activity_barrier: ["time"],
  diet: "average",
  alcohol: "light",
  smoking: "never",
  sleep: "belowavg",
  stress: "high",
  conditions: ["highbp"],
  hormonal_male: ["drive", "fatigue"],
  social: "few",
  genetics: "mixed",
  goal: ["strength"],
};

const FEMALE_ANSWERS: Answers = {
  ...MALE_ANSWERS,
  sex: "female",
  hormonal_female: "peri",
};

function answersFor(scan: Answers): Record<string, string | string[]> {
  const deep: Record<string, string | string[]> = {};
  for (const q of getDeepscanQuestions(scan)) {
    deep[q.id] = q.multi ? [q.options[0].value] : q.options[0].value;
  }
  return deep;
}

describe("deepscan questions", () => {
  it("branches the intake by sex from the scan answers", () => {
    const male = getDeepscanQuestions(MALE_ANSWERS).map((q) => q.id);
    const female = getDeepscanQuestions(FEMALE_ANSWERS).map((q) => q.id);

    expect(male).toContain("ds_waist_m");
    expect(male).toContain("ds_hormone_m");
    expect(male).not.toContain("ds_waist_f");
    expect(male).not.toContain("ds_hormone_f");

    expect(female).toContain("ds_waist_f");
    expect(female).toContain("ds_hormone_f");
    expect(female).not.toContain("ds_waist_m");
    expect(female).not.toContain("ds_hormone_m");
  });

  it("every question has at least 3 options, a section, and a unique id", () => {
    const ids = new Set(DEEPSCAN_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(DEEPSCAN_QUESTIONS.length);
    for (const q of DEEPSCAN_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.section.length).toBeGreaterThan(0);
    }
  });

  it("each buyer gets a 20-30 question intake (the full-process depth)", () => {
    for (const scan of [MALE_ANSWERS, FEMALE_ANSWERS]) {
      const count = getDeepscanQuestions(scan).length;
      expect(count).toBeGreaterThanOrEqual(20);
      expect(count).toBeLessThanOrEqual(30);
    }
  });

  it("validates a complete answer set and rejects incomplete or foreign ones", () => {
    const deep = answersFor(MALE_ANSWERS);
    expect(validateDeepscanAnswers(MALE_ANSWERS, deep)).toBe(true);

    const missing = { ...deep };
    delete missing.ds_rhr;
    expect(validateDeepscanAnswers(MALE_ANSWERS, missing)).toBe(false);

    expect(
      validateDeepscanAnswers(MALE_ANSWERS, { ...deep, hacked: "yes" })
    ).toBe(false);
    expect(
      validateDeepscanAnswers(MALE_ANSWERS, { ...deep, ds_rhr: "not-an-option" })
    ).toBe(false);
    // A female-only question is foreign to a male intake.
    expect(
      validateDeepscanAnswers(MALE_ANSWERS, { ...deep, ds_hormone_f: ["none"] })
    ).toBe(false);
  });
});

describe("deepscan fallback builder", () => {
  it("produces a schema-valid report, deterministically", () => {
    const deep = answersFor(MALE_ANSWERS);
    const result = computeResult(MALE_ANSWERS, new Date("2026-01-01"));
    const a = buildDeepscanFallback(result, MALE_ANSWERS, deep);
    const b = buildDeepscanFallback(result, MALE_ANSWERS, deep);
    expect(DeepscanReportSchema.parse(a)).toBeTruthy();
    expect(a).toEqual(b);
    expect(a.markers.length).toBeGreaterThanOrEqual(8);
    expect(a.priorities.length).toBeGreaterThanOrEqual(3);
    // Every section carries concrete actions (the "actionable" payload).
    expect(a.sections.length).toBeGreaterThanOrEqual(5);
    for (const section of a.sections) {
      expect(section.actions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("writes sex-appropriate hormonal sections", () => {
    const male = buildDeepscanFallback(
      computeResult(MALE_ANSWERS, new Date("2026-01-01")),
      MALE_ANSWERS,
      answersFor(MALE_ANSWERS)
    );
    const female = buildDeepscanFallback(
      computeResult(FEMALE_ANSWERS, new Date("2026-01-01")),
      FEMALE_ANSWERS,
      answersFor(FEMALE_ANSWERS)
    );
    expect(male.sections.some((s) => s.title === "Hormonal signals")).toBe(true);
    expect(female.sections.some((s) => s.title === "Hormonal stage")).toBe(true);
  });

  it("never contains an em-dash (house style)", () => {
    const report = buildDeepscanFallback(
      computeResult(FEMALE_ANSWERS, new Date("2026-01-01")),
      FEMALE_ANSWERS,
      answersFor(FEMALE_ANSWERS)
    );
    expect(JSON.stringify(report)).not.toMatch(/[—–]/);
  });
});

describe("runDeepscan", () => {
  it("uses the deterministic engine when no API key is configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { report, model } = await runDeepscan(
      MALE_ANSWERS,
      answersFor(MALE_ANSWERS)
    );
    expect(model).toBe(DEEPSCAN_FALLBACK_MODEL);
    expect(DeepscanReportSchema.parse(report)).toBeTruthy();
    vi.unstubAllEnvs();
  });
});

describe("runDeepscanAction", () => {
  beforeEach(() => {
    __clearMemory();
    vi.stubEnv("ANTHROPIC_API_KEY", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function readyOrder(answers: Answers) {
    const order = await createOrder(answers);
    const guide = buildGuide(computeResult(answers), answers);
    await markReady(order.token, guide, "deterministic-v1");
    return order.token;
  }

  it("runs once per order and is idempotent on replays", async () => {
    const token = await readyOrder(MALE_ANSWERS);
    const deep = answersFor(MALE_ANSWERS);

    const first = await runDeepscanAction(token, deep);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.deepscan.model).toBe(DEEPSCAN_FALLBACK_MODEL);

    // Replay (double click / refresh) returns the stored record, even with
    // different answers, so a purchase can never fund a second run.
    const replay = await runDeepscanAction(token, {});
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;
    expect(replay.deepscan.generatedAt).toBe(first.deepscan.generatedAt);
  });

  it("rejects unknown orders and incomplete answers", async () => {
    expect((await runDeepscanAction("nope", {})).ok).toBe(false);

    const token = await readyOrder(FEMALE_ANSWERS);
    const incomplete = answersFor(FEMALE_ANSWERS);
    delete incomplete.ds_bp;
    expect((await runDeepscanAction(token, incomplete)).ok).toBe(false);
  });

  it("rejects orders that are not ready", async () => {
    const order = await createOrder(MALE_ANSWERS, "awaiting_payment");
    const res = await runDeepscanAction(order.token, answersFor(MALE_ANSWERS));
    expect(res.ok).toBe(false);
  });
});
