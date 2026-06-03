# Phase C - Plan 1: Guide Quality Overhaul (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the thin, generic generated guide with a bespoke, prescriptive coaching document (specific workouts with sets/reps/progression, real foods and portions, a daily blueprint, a first-7-days quickstart, and troubleshooting) so the paid product is genuinely worth it.

**Architecture:** Keep the deterministic engine + Claude Sonnet 4.6 + the `emit_guide` structured-output tool. Greatly expand the `GuideDoc` zod schema, rewrite the generation prompt to demand specificity, raise `max_tokens`, expand the deterministic offline stub, and re-render the richer document in both the on-screen guide view and the PDF. `generate.ts`/`orders.ts`/`start.ts` are unchanged.

**Tech Stack:** TypeScript, zod v4 (`z.toJSONSchema`), `@anthropic-ai/sdk` (Sonnet 4.6), `@react-pdf/renderer`, React 19 / Next 16, Tailwind v4 (dark-monitor theme), vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-06-03-phase-c-premium-guide-conversion-design.md` (Plan 1 section).

**Branch:** `feat/phase-c-premium-guide` (already created and checked out).

---

## Critical sequencing note (read first)

Expanding the `GuideDoc` schema (Task 1) immediately makes the **old** `guide-view.tsx` and `guide-pdf.tsx` reference fields that no longer exist, so a full `tsc`/`npm run build` will FAIL until those two files are rewritten (Tasks 4 and 5).

This is expected and safe because the unit tests run under vitest (esbuild, which strips types and does not type-check) and none of the test files import the view or the PDF. Therefore:

- **Tasks 1-3 validate with `npm test` (vitest) only. Do NOT run `npx tsc --noEmit` or `npm run build` in Tasks 1-3; they will report pre-existing errors in the not-yet-updated view/PDF.**
- **Task 5 is the first task that runs `tsc`/`lint`/`build` (after both the view and PDF are updated).**
- **Task 6 runs the full loop including Playwright e2e.**

To keep the existing e2e passing without modifying it, the rewritten guide view MUST keep a section titled exactly **"Your 8-week plan"** and a link labeled exactly **"Download your PDF"**, and the `<h1>` stays `guide.title` (which is `PRODUCT.name`, "The Second Wind Protocol").

---

## File Structure

- `lib/guide/schema.ts` - rewrite: the expanded `GuideDoc` + nested schemas/types. Source of truth.
- `lib/guide/schema.test.ts` - rewrite: validate the new shape.
- `lib/guide/fixture.ts` - rewrite: deterministic stub in the new shape.
- `lib/guide/fixture.test.ts` - unchanged (its three assertions still hold); re-run to confirm.
- `lib/guide/prompt.ts` - rewrite: premium-depth system + user prompts.
- `lib/guide/prompt.test.ts` - update: assert the new specificity mandate.
- `lib/guide/model.ts` - one-line change: raise `max_tokens`.
- `lib/guide/generate.test.ts` - unchanged (uses the fixture + schema, both updated in lockstep); re-run to confirm.
- `components/guide/guide-view.tsx` - rewrite: render the richer document (design-taste-frontend-v1).
- `components/guide/guide-pdf.tsx` - rewrite: render the richer document to PDF.

---

## Task 1: Expand the GuideDoc schema

**Files:**
- Rewrite: `lib/guide/schema.ts`
- Rewrite: `lib/guide/schema.test.ts`

- [ ] **Step 1: Write the failing test (replace the whole file)**

Replace the entire contents of `lib/guide/schema.test.ts` with:
```ts
import { describe, it, expect } from "vitest";
import { GuideDocSchema, AnswersSchema } from "@/lib/guide/schema";

function validExercise() {
  return {
    name: "Goblet squat",
    sets: "3",
    reps: "8-10",
    rest: "75s",
    cues: "Chest tall, knees tracking over toes",
    progression: "Add 2.5 kg once you hit 10 clean reps",
  };
}

function validWeek(week: number) {
  return {
    week,
    theme: `Week ${week} theme`,
    focus: `Week ${week} focus`,
    workouts: [
      { day: "Monday", title: "Full body A", exercises: [validExercise()] },
    ],
    nutritionFocus: "Protein at every meal",
    habit: {
      name: "Post-lunch walk",
      trigger: "Right after lunch",
      why: "Stacks an easy win onto an existing cue",
    },
    checkpoint: "You completed both sessions",
  };
}

const validGuide = {
  title: "The Second Wind Protocol",
  intro: "Built from your scan.",
  yourSituation: "You are sedentary with elevated body fat.",
  strategy: "We attack activity first, then diet.",
  weeks: Array.from({ length: 8 }, (_, i) => validWeek(i + 1)),
  nutritionPlan: {
    principles: ["Aim for roughly 1.6 g protein per kg"],
    sampleDay: {
      breakfast: "Eggs and oats",
      lunch: "Chicken and rice",
      dinner: "Salmon and greens",
      snacks: "Greek yogurt",
    },
    swaps: [{ from: "Soda", to: "Sparkling water" }],
    groceryStaples: ["Eggs", "Chicken", "Oats"],
  },
  dailyBlueprint: [{ time: "07:00", activity: "Wake, water, short walk" }],
  sleepAndStress: {
    summary: "Fix your nights first.",
    protocol: ["Fixed wake time", "No screens 30 minutes before bed"],
  },
  tenMinutePlan: {
    summary: "No-excuses fallback.",
    movements: [{ name: "Bodyweight squat", detail: "2 minutes" }],
  },
  next7Days: Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    action: `Do task ${i + 1}`,
  })),
  troubleshooting: [{ problem: "No time", fix: "Use the 10-minute plan" }],
  recalibration: "Tighten weekly.",
  outcomes: ["Lose around 5 kg of body fat"],
  closing: "You started today. Keep going.",
};

describe("GuideDocSchema", () => {
  it("accepts a fully-formed guide", () => {
    expect(() => GuideDocSchema.parse(validGuide)).not.toThrow();
  });

  it("rejects a guide without exactly 8 weeks", () => {
    expect(() =>
      GuideDocSchema.parse({ ...validGuide, weeks: validGuide.weeks.slice(0, 6) })
    ).toThrow();
  });

  it("rejects next7Days that is not exactly 7 entries", () => {
    expect(() =>
      GuideDocSchema.parse({ ...validGuide, next7Days: validGuide.next7Days.slice(0, 5) })
    ).toThrow();
  });

  it("rejects a malformed exercise (missing sets)", () => {
    const bad = structuredClone(validGuide);
    delete (bad.weeks[0].workouts[0].exercises[0] as Record<string, unknown>).sets;
    expect(() => GuideDocSchema.parse(bad)).toThrow();
  });

  it("rejects a missing top-level section", () => {
    const { nutritionPlan, ...bad } = validGuide;
    void nutritionPlan;
    expect(() => GuideDocSchema.parse(bad)).toThrow();
  });
});

describe("AnswersSchema", () => {
  it("accepts answers with age", () => {
    expect(() => AnswersSchema.parse({ age: 35, smoking: "never" })).not.toThrow();
  });
  it("rejects answers without age", () => {
    expect(() => AnswersSchema.parse({ smoking: "never" })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/guide/schema.test.ts`
Expected: FAIL (the new shape is not yet defined; parsing the valid guide throws).

- [ ] **Step 3: Rewrite the schema (replace the whole file)**

Replace the entire contents of `lib/guide/schema.ts` with:
```ts
import { z } from "zod";

// --- Guide building blocks ---

export const ExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.string().min(1),
  reps: z.string().min(1),
  rest: z.string().min(1),
  cues: z.string().min(1),
  progression: z.string().min(1),
});

export const WorkoutSchema = z.object({
  day: z.string().min(1),
  title: z.string().min(1),
  exercises: z.array(ExerciseSchema).min(1),
});

export const HabitSchema = z.object({
  name: z.string().min(1),
  trigger: z.string().min(1),
  why: z.string().min(1),
});

export const GuideWeekSchema = z.object({
  week: z.number().int().min(1).max(8),
  theme: z.string().min(1),
  focus: z.string().min(1),
  workouts: z.array(WorkoutSchema).min(1),
  nutritionFocus: z.string().min(1),
  habit: HabitSchema,
  checkpoint: z.string().min(1),
});

export const SwapSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export const NutritionPlanSchema = z.object({
  principles: z.array(z.string().min(1)).min(1),
  sampleDay: z.object({
    breakfast: z.string().min(1),
    lunch: z.string().min(1),
    dinner: z.string().min(1),
    snacks: z.string().min(1),
  }),
  swaps: z.array(SwapSchema).min(1),
  groceryStaples: z.array(z.string().min(1)).min(1),
});

export const BlueprintBlockSchema = z.object({
  time: z.string().min(1),
  activity: z.string().min(1),
});

export const SleepStressSchema = z.object({
  summary: z.string().min(1),
  protocol: z.array(z.string().min(1)).min(1),
});

export const MovementSchema = z.object({
  name: z.string().min(1),
  detail: z.string().min(1),
});

export const TenMinutePlanSchema = z.object({
  summary: z.string().min(1),
  movements: z.array(MovementSchema).min(1),
});

export const DayActionSchema = z.object({
  day: z.string().min(1),
  action: z.string().min(1),
});

export const TroubleshootSchema = z.object({
  problem: z.string().min(1),
  fix: z.string().min(1),
});

export const GuideDocSchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  yourSituation: z.string().min(1),
  strategy: z.string().min(1),
  weeks: z.array(GuideWeekSchema).length(8),
  nutritionPlan: NutritionPlanSchema,
  dailyBlueprint: z.array(BlueprintBlockSchema).min(1),
  sleepAndStress: SleepStressSchema,
  tenMinutePlan: TenMinutePlanSchema,
  next7Days: z.array(DayActionSchema).length(7),
  troubleshooting: z.array(TroubleshootSchema).min(1),
  recalibration: z.string().min(1),
  outcomes: z.array(z.string().min(1)).min(1),
  closing: z.string().min(1),
});

export type Exercise = z.infer<typeof ExerciseSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type GuideWeek = z.infer<typeof GuideWeekSchema>;
export type GuideDoc = z.infer<typeof GuideDocSchema>;

// Loose validation for the raw scan answers carried into checkout. Keys are
// question ids; values are strings or numbers. Age must be present.
export const AnswersSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .refine((a) => a.age !== undefined, { message: "age is required" });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/guide/schema.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/guide/schema.ts lib/guide/schema.test.ts
git commit -m "feat: expand GuideDoc schema for a prescriptive, premium guide"
```

---

## Task 2: Rewrite the deterministic fixture

**Files:**
- Rewrite: `lib/guide/fixture.ts`
- Test: `lib/guide/fixture.test.ts` (unchanged; re-run to confirm)

The existing `fixture.test.ts` asserts the fixture is schema-valid, deterministic, and that week 1's focus contains the top risk category. Those still hold for the new fixture, so do NOT change the test; just re-run it.

- [ ] **Step 1: Confirm the test currently fails against the new schema**

Run: `npx vitest run lib/guide/fixture.test.ts`
Expected: FAIL (the old fixture returns the old shape, which the new `GuideDocSchema` rejects).

- [ ] **Step 2: Rewrite the fixture (replace the whole file)**

Replace the entire contents of `lib/guide/fixture.ts` with:
```ts
import type { ScanResult } from "@/lib/longevity";
import { PRODUCT } from "@/lib/product";
import type { GuideDoc, GuideWeek } from "@/lib/guide/schema";

// Deterministic, offline guide in the full GuideDoc shape. Powers the stub
// generator (no API key) and the tests. No randomness, no network.
export function buildFixtureGuide(result: ScanResult): GuideDoc {
  const risks = result.topRisks.length
    ? result.topRisks.map((r) => r.category)
    : ["Physical activity", "Diet quality", "Sleep"];

  const weeks: GuideWeek[] = Array.from({ length: 8 }, (_, i) => {
    const target = risks[i % risks.length];
    return {
      week: i + 1,
      theme: `Build the base for ${target.toLowerCase()}`,
      focus: `Week ${i + 1}: ${target}`,
      workouts: [
        {
          day: "Monday",
          title: "Full body strength A",
          exercises: [
            {
              name: "Goblet squat",
              sets: "3",
              reps: "8-10",
              rest: "75s",
              cues: "Chest tall, knees tracking over your toes",
              progression: "Add 2.5 kg once you hit 10 clean reps",
            },
            {
              name: "Incline push-up",
              sets: "3",
              reps: "6-12",
              rest: "60s",
              cues: "Ribs down, full range",
              progression: "Lower the incline as you get stronger",
            },
          ],
        },
        {
          day: "Thursday",
          title: "Full body strength B",
          exercises: [
            {
              name: "Dumbbell Romanian deadlift",
              sets: "3",
              reps: "8-10",
              rest: "75s",
              cues: "Hinge at the hips, keep a flat back",
              progression: "Add load when your form holds",
            },
            {
              name: "One-arm dumbbell row",
              sets: "3",
              reps: "8-12",
              rest: "60s",
              cues: "Pull to the hip, no torso twist",
              progression: "Add reps first, then load",
            },
          ],
        },
      ],
      nutritionFocus: "Protein at every meal and a vegetable at two of them",
      habit: {
        name: "Post-lunch walk",
        trigger: "Right after you finish lunch",
        why: "Stacks movement onto a cue you already have, so it sticks",
      },
      checkpoint: "You finished both sessions and hit protein on most days",
    };
  });

  return {
    title: PRODUCT.name,
    intro: `This plan is built from your scan. It leads with ${risks[0].toLowerCase()}, the biggest drag on your projection, then works down your list in order of impact.`,
    yourSituation: `At ${result.currentAge}, your largest modifiable risks are ${risks
      .slice(0, 2)
      .join(" and ")
      .toLowerCase()}. That is where your recoverable years come from.`,
    strategy: `We go after ${risks[0].toLowerCase()} first because it is costing you the most, then layer in the rest once the first change holds.`,
    weeks,
    nutritionPlan: {
      principles: [
        "Eat protein at every meal, roughly a palm-sized portion",
        "Build each plate around protein, vegetables, and a whole-food carb",
        "Stop eating about three hours before bed",
      ],
      sampleDay: {
        breakfast: "Three eggs, oats, and a handful of berries",
        lunch: "Chicken, rice, and a big salad",
        dinner: "Salmon or tofu with potatoes and greens",
        snacks: "Greek yogurt, or fruit with a few nuts",
      },
      swaps: [
        { from: "Soda or juice", to: "Sparkling water with lime" },
        { from: "Chips", to: "Greek yogurt or edamame" },
      ],
      groceryStaples: [
        "Eggs",
        "Chicken",
        "Oats",
        "Rice",
        "Frozen vegetables",
        "Greek yogurt",
        "Olive oil",
      ],
    },
    dailyBlueprint: [
      { time: "07:00", activity: "Wake at a fixed time, water, ten minutes of light movement" },
      { time: "12:30", activity: "Protein-forward lunch, then a short walk" },
      { time: "18:00", activity: "Training session on training days" },
      { time: "21:30", activity: "Screens off, ten-minute wind-down, lights out" },
    ],
    sleepAndStress: {
      summary:
        "Get your nights and your nervous system back first; everything else gets easier.",
      protocol: [
        "Set one fixed wake time, seven days a week",
        "No screens for thirty minutes before bed",
        "Two minutes of slow breathing when stress spikes",
      ],
    },
    tenMinutePlan: {
      summary: "On the days life wins, this is the minimum that still counts.",
      movements: [
        { name: "Bodyweight squats", detail: "2 minutes at an easy pace" },
        { name: "Push-ups or incline push-ups", detail: "3 rounds of what you can do" },
        { name: "Slow breathing", detail: "2 minutes to finish" },
      ],
    },
    next7Days: [
      { day: "Day 1", action: "Do the 10-minute plan and set your fixed wake time" },
      { day: "Day 2", action: "Walk for 15 minutes and hit protein at every meal" },
      { day: "Day 3", action: "Run Week 1 strength session A" },
      { day: "Day 4", action: "Walk, then do the wind-down routine tonight" },
      { day: "Day 5", action: "Run Week 1 strength session B" },
      { day: "Day 6", action: "Make one swap from the nutrition list" },
      { day: "Day 7", action: "Review the week and write down one win" },
    ],
    troubleshooting: [
      { problem: "No time this week", fix: "Fall back to the 10-minute plan; it still counts" },
      { problem: "Lost motivation", fix: "Shrink the task. Do only the first two minutes" },
      { problem: "Sore or run down", fix: "Swap a strength day for a walk and a full night of sleep" },
    ],
    recalibration:
      "Each week the plan tightens as your numbers move. Repeat what worked, replace what did not.",
    outcomes: result.outcomes.map((o) => o.label),
    closing:
      "The date you saw assumes you change nothing. You already changed something by starting. Keep going.",
  };
}
```

- [ ] **Step 3: Run the fixture test to verify it passes**

Run: `npx vitest run lib/guide/fixture.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 4: Run the full unit suite (confirms generate.test still green with the new fixture+schema)**

Run: `npm test`
Expected: all test files PASS. (Do NOT run tsc/build yet; the view and PDF are still on the old shape.)

- [ ] **Step 5: Commit**

```bash
git add lib/guide/fixture.ts
git commit -m "feat: deterministic fixture guide in the expanded shape"
```

---

## Task 3: Rewrite the prompt and raise max_tokens

**Files:**
- Rewrite: `lib/guide/prompt.ts`
- Update: `lib/guide/prompt.test.ts`
- Modify: `lib/guide/model.ts` (one line)

- [ ] **Step 1: Update the test (replace the whole file)**

Replace the entire contents of `lib/guide/prompt.test.ts` with:
```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/guide/prompt.test.ts`
Expected: FAIL on the new `sets|reps` / `specific|prescriptive|exactly` assertions (the old prompt lacks them).

- [ ] **Step 3: Rewrite the prompt (replace the whole file)**

Replace the entire contents of `lib/guide/prompt.ts` with:
```ts
import { QUESTIONS, type Answers, type ScanResult } from "@/lib/longevity";
import { PRODUCT, INCLUDED } from "@/lib/product";

const GOAL_LABEL: Record<string, string> = {
  fat: "Lose body fat",
  strength: "Build strength and muscle",
  energy: "More energy and better sleep",
  heart: "Protect their heart and live longer",
};

function optionLabel(questionId: string, value: unknown): string | null {
  const q = QUESTIONS.find((x) => x.id === questionId);
  const opt = q?.options?.find((o) => o.value === value);
  return opt?.label ?? null;
}

// Long, cache-friendly system instructions. Kept stable across users so the
// prompt cache hits. Defines the persona, the specificity mandate, and the
// structure to emit.
export function buildSystemPrompt(): string {
  const included = INCLUDED.map((i) => `- ${i.label}: ${i.note}`).join("\n");
  return [
    `You are an elite strength and longevity coach. You personally reviewed this client's lifestyle scan and you are writing "${PRODUCT.name}", their bespoke 8-week protocol.`,
    `Return your answer ONLY by calling the emit_guide tool with structured JSON. Write nothing outside the tool call.`,
    ``,
    `This is a paid product. It must be specific, prescriptive, and genuinely worth the price. The reader should feel it was written for them, and should always know exactly what to do next. Never write generic advice they could get free from a search engine.`,
    ``,
    `The protocol must deliver everything the client was promised:`,
    included,
    ``,
    `Hard rules:`,
    `- Exactly 8 weeks. Order them so the client's highest-impact modifiable risks are addressed first, then down the list in order.`,
    `- Every workout exercise must include concrete sets, reps, rest, a form cue, and how to progress it next time. Use real exercise names.`,
    `- Calibrate difficulty to the client's level: a true beginner if they are sedentary or never learned to train; low-impact progressions if they have a past injury; time-efficient sessions if their barrier is time; accountability and tiny wins if their barrier is motivation.`,
    `- Nutrition must name real foods and rough portions, not vague advice. Swaps must be specific to what they eat now.`,
    `- next7Days must give exactly seven concrete daily actions they can start immediately.`,
    `- Reference the client's actual answers throughout. Be specific.`,
    `- No medical claims, no diagnoses, no calorie obsession.`,
    `- Never use em-dashes (no long dash characters). Use commas, periods, or hyphens.`,
  ].join("\n");
}

export function buildUserPrompt(result: ScanResult, answers: Answers): string {
  const goal = result.primaryGoal
    ? GOAL_LABEL[result.primaryGoal] ?? result.primaryGoal
    : "General longevity";
  const barrier = optionLabel("activity_barrier", answers.activity_barrier);
  const topRisks = result.topRisks
    .map((r, i) => `${i + 1}. ${r.category} (their answer: ${r.answerLabel}) - ${r.detail}`)
    .join("\n");
  const strengths =
    result.strengths.map((s) => `- ${s.category}: ${s.answerLabel}`).join("\n") ||
    "- None notable";
  const levels = result.factors.map((f) => `- ${f.category}: ${f.answerLabel}`).join("\n");
  const outcomes = result.outcomes.map((o) => `- ${o.label}`).join("\n");

  return [
    `Client profile:`,
    `- Age: ${result.currentAge}`,
    `- Primary goal: ${goal}`,
    barrier
      ? `- Training barrier (shape the plan around this): ${barrier}`
      : `- Training barrier: not specified`,
    `- Recoverable years if they fix their modifiable risks: about ${result.recoverableYears}`,
    ``,
    `Highest-impact modifiable risks (attack in this exact order):`,
    topRisks || "None notable",
    ``,
    `Already working in their favor (build on these):`,
    strengths,
    ``,
    `Every scored factor and the client's answer (use these to calibrate intensity):`,
    levels,
    ``,
    `Promised outcomes to deliver against:`,
    outcomes,
    ``,
    `Write this client's bespoke 8-week protocol now via emit_guide. Be specific enough that they could start today without asking a single follow-up question.`,
  ].join("\n");
}

export function buildGuidePrompt(
  result: ScanResult,
  answers: Answers
): { system: string; user: string } {
  return { system: buildSystemPrompt(), user: buildUserPrompt(result, answers) };
}
```

- [ ] **Step 4: Raise `max_tokens` in `lib/guide/model.ts`**

In `lib/guide/model.ts`, change the line:
```ts
    max_tokens: 8000,
```
to:
```ts
    max_tokens: 16000,
```

- [ ] **Step 5: Run the prompt test and the full suite**

Run: `npx vitest run lib/guide/prompt.test.ts`
Expected: PASS (2 tests).

Run: `npm test`
Expected: all PASS. (Still do NOT run tsc/build; view and PDF come next.)

- [ ] **Step 6: Commit**

```bash
git add lib/guide/prompt.ts lib/guide/prompt.test.ts lib/guide/model.ts
git commit -m "feat: premium-depth guide prompt; raise generation max_tokens"
```

---

## Task 4: Rewrite the guide view for the new shape

**Files:**
- Rewrite: `components/guide/guide-view.tsx`

> UI sub-skill: build/refine with `design-taste-frontend-v1` (invoke it via the Skill tool). Stay in the locked dark-monitor theme and `monitor-*` tokens, mono for numbers, no em-dashes. The code below is a correct, on-theme baseline; elevate it with the skill but keep behavior, the `{ guide, token }` props, the exact section title "Your 8-week plan", and the "Download your PDF" link text (the e2e depends on those two strings).

- [ ] **Step 1: Replace the whole file with the baseline**

Replace the entire contents of `components/guide/guide-view.tsx` with:
```tsx
import type { GuideDoc } from "@/lib/guide/schema";

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
        {title}
      </span>
      <span className="h-px flex-1 bg-monitor-line" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionLabel title={title} />
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3.5">
          <span
            aria-hidden
            className="mt-px font-mono text-sm font-semibold text-monitor-accent"
          >
            +
          </span>
          <span className="text-sm leading-relaxed text-monitor-fg">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function GuideView({ guide, token }: { guide: GuideDoc; token: string }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-14 px-6 pt-20 pb-28">
      {/* Hero */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            Your protocol is ready
          </span>
          <div className="h-px w-8 bg-monitor-accent" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-monitor-fg">
          {guide.title}
        </h1>
        <p className="max-w-[58ch] text-lg leading-relaxed text-monitor-muted">
          {guide.intro}
        </p>
        <a
          href={`/guide/${token}/pdf`}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-monitor-accent px-6 py-3.5 text-sm font-semibold text-monitor-bg transition-colors hover:bg-monitor-accent/90 active:scale-[0.98] sm:w-fit"
        >
          Download your PDF
        </a>
      </div>

      {/* Situation + strategy */}
      <Section title="Where you stand">
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.yourSituation}</p>
        <p className="text-sm leading-relaxed text-monitor-muted">{guide.strategy}</p>
      </Section>

      {/* Outcomes */}
      <Section title="What these 8 weeks deliver">
        <Bullets items={guide.outcomes} />
      </Section>

      {/* First 7 days */}
      <Section title="Start here: your first 7 days">
        <ol className="flex flex-col gap-2">
          {guide.next7Days.map((d) => (
            <li key={d.day} className="flex gap-3 text-sm leading-relaxed">
              <span className="w-14 shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-monitor-accent">
                {d.day}
              </span>
              <span className="text-monitor-fg">{d.action}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 8-week plan (title string is required by the e2e) */}
      <Section title="Your 8-week plan">
        <div className="flex flex-col gap-3">
          {guide.weeks.map((w) => (
            <div
              key={w.week}
              className="overflow-hidden rounded-lg border border-monitor-line bg-monitor-panel"
            >
              <div className="flex">
                <div className="w-1 shrink-0 bg-monitor-accent/25" />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-2xl tracking-tighter text-monitor-accent">
                      {String(w.week).padStart(2, "0")}
                    </span>
                    <span className="h-px flex-1 bg-monitor-line" />
                    <span className="text-sm font-semibold text-monitor-fg">{w.focus}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-monitor-muted">{w.theme}</p>

                  {w.workouts.map((wo, wi) => (
                    <div key={wi} className="flex flex-col gap-2 border-t border-monitor-line pt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-monitor-accent/70">
                          {wo.day}
                        </span>
                        <span className="text-sm font-semibold text-monitor-fg">{wo.title}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {wo.exercises.map((ex, ei) => (
                          <div key={ei} className="flex flex-col gap-0.5">
                            <div className="flex flex-wrap items-baseline gap-x-3">
                              <span className="text-sm text-monitor-fg">{ex.name}</span>
                              <span className="font-mono text-xs text-monitor-accent">
                                {ex.sets} x {ex.reps}
                              </span>
                              <span className="font-mono text-[11px] text-monitor-muted">
                                rest {ex.rest}
                              </span>
                            </div>
                            <span className="text-xs leading-relaxed text-monitor-muted">
                              {ex.cues}. Progress: {ex.progression}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-1 border-t border-monitor-line pt-3">
                    <span className="text-sm leading-relaxed text-monitor-fg">
                      Nutrition focus: {w.nutritionFocus}
                    </span>
                    <span className="text-sm leading-relaxed text-monitor-muted">
                      Habit: {w.habit.name} ({w.habit.trigger}). {w.habit.why}
                    </span>
                    <span className="text-sm leading-relaxed text-monitor-muted/70 italic">
                      Checkpoint: {w.checkpoint}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Nutrition */}
      <Section title="Your nutrition plan">
        <Bullets items={guide.nutritionPlan.principles} />
        <div className="rounded-lg border border-monitor-line bg-monitor-panel p-5">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-monitor-muted">
            A day on the plan
          </span>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            {([
              ["Breakfast", guide.nutritionPlan.sampleDay.breakfast],
              ["Lunch", guide.nutritionPlan.sampleDay.lunch],
              ["Dinner", guide.nutritionPlan.sampleDay.dinner],
              ["Snacks", guide.nutritionPlan.sampleDay.snacks],
            ] as const).map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-20 shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-monitor-accent">
                  {k}
                </dt>
                <dd className="text-monitor-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-monitor-muted">
            Swaps
          </span>
          {guide.nutritionPlan.swaps.map((s, i) => (
            <p key={i} className="text-sm text-monitor-fg">
              <span className="text-monitor-muted line-through">{s.from}</span>{" "}
              <span aria-hidden className="text-monitor-accent">{"->"}</span> {s.to}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-monitor-muted">
            Grocery staples
          </span>
          <p className="text-sm leading-relaxed text-monitor-fg">
            {guide.nutritionPlan.groceryStaples.join(", ")}
          </p>
        </div>
      </Section>

      {/* Daily blueprint */}
      <Section title="Your daily blueprint">
        <ul className="flex flex-col gap-2">
          {guide.dailyBlueprint.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="w-16 shrink-0 font-mono text-xs text-monitor-accent">{b.time}</span>
              <span className="text-monitor-fg">{b.activity}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Sleep & stress */}
      <Section title="Sleep and stress recovery">
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.sleepAndStress.summary}</p>
        <Bullets items={guide.sleepAndStress.protocol} />
      </Section>

      {/* 10-minute plan */}
      <Section title="The 10-minute fallback">
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.tenMinutePlan.summary}</p>
        <ul className="flex flex-col gap-2">
          {guide.tenMinutePlan.movements.map((m, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-x-3 text-sm">
              <span className="text-monitor-fg">{m.name}</span>
              <span className="font-mono text-xs text-monitor-muted">{m.detail}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Troubleshooting */}
      <Section title="When it gets hard">
        <div className="flex flex-col gap-3">
          {guide.troubleshooting.map((t, i) => (
            <div key={i} className="rounded-lg border border-monitor-line bg-monitor-panel p-4">
              <p className="text-sm font-semibold text-monitor-fg">{t.problem}</p>
              <p className="mt-1 text-sm leading-relaxed text-monitor-muted">{t.fix}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Recalibration + closing */}
      <Section title="Weekly recalibration">
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.recalibration}</p>
      </Section>

      <p className="text-base leading-relaxed text-monitor-fg">{guide.closing}</p>
    </main>
  );
}
```

- [ ] **Step 2: Apply design-taste-frontend-v1**

Invoke the `design-taste-frontend-v1` skill and refine the visual presentation of this view (hierarchy, the week cards, the nutrition and blueprint blocks) within the dark-monitor theme and `monitor-*` tokens. Keep the `{ guide, token }` props, the "Your 8-week plan" section title, and the "Download your PDF" link text exactly. No em-dashes.

- [ ] **Step 3: Commit** (do not run tsc/build yet; the PDF is updated in Task 5)

```bash
git add components/guide/guide-view.tsx
git commit -m "feat: render the expanded guide in the guide view"
```

---

## Task 5: Rewrite the PDF for the new shape

**Files:**
- Rewrite: `components/guide/guide-pdf.tsx`

- [ ] **Step 1: Replace the whole file**

Replace the entire contents of `components/guide/guide-pdf.tsx` with:
```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GuideDoc } from "@/lib/guide/schema";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#0b1417", lineHeight: 1.5 },
  h1: { fontSize: 22, marginBottom: 6 },
  h2: { fontSize: 13, marginTop: 16, marginBottom: 6, color: "#0a8f7d" },
  para: { marginBottom: 6, color: "#1f2d31" },
  muted: { marginBottom: 6, color: "#3a4a4f" },
  item: { marginBottom: 2 },
  weekTitle: { fontSize: 12, marginTop: 10, marginBottom: 2 },
  exTitle: { fontSize: 11, marginTop: 4 },
  exMeta: { color: "#3a4a4f", marginBottom: 2 },
  label: { fontSize: 9, color: "#0a8f7d", marginTop: 4, marginBottom: 1 },
});

export function GuidePdfDocument({ guide }: { guide: GuideDoc }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{guide.title}</Text>
        <Text style={styles.para}>{guide.intro}</Text>
        <Text style={styles.muted}>{guide.yourSituation}</Text>
        <Text style={styles.muted}>{guide.strategy}</Text>

        <Text style={styles.h2}>What these 8 weeks deliver</Text>
        {guide.outcomes.map((o, i) => (
          <Text key={i} style={styles.item}>- {o}</Text>
        ))}

        <Text style={styles.h2}>Start here: your first 7 days</Text>
        {guide.next7Days.map((d, i) => (
          <Text key={i} style={styles.item}>{d.day}: {d.action}</Text>
        ))}

        <Text style={styles.h2}>Your 8-week plan</Text>
        {guide.weeks.map((w) => (
          <View key={w.week} wrap={false}>
            <Text style={styles.weekTitle}>{w.focus}</Text>
            <Text style={styles.muted}>{w.theme}</Text>
            {w.workouts.map((wo, wi) => (
              <View key={wi}>
                <Text style={styles.exTitle}>{wo.day}: {wo.title}</Text>
                {wo.exercises.map((ex, ei) => (
                  <View key={ei}>
                    <Text style={styles.item}>{ex.name}: {ex.sets} x {ex.reps}, rest {ex.rest}</Text>
                    <Text style={styles.exMeta}>{ex.cues}. Progress: {ex.progression}</Text>
                  </View>
                ))}
              </View>
            ))}
            <Text style={styles.item}>Nutrition focus: {w.nutritionFocus}</Text>
            <Text style={styles.item}>Habit: {w.habit.name} ({w.habit.trigger}). {w.habit.why}</Text>
            <Text style={styles.muted}>Checkpoint: {w.checkpoint}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Your nutrition plan</Text>
        {guide.nutritionPlan.principles.map((p, i) => (
          <Text key={i} style={styles.item}>- {p}</Text>
        ))}
        <Text style={styles.label}>A day on the plan</Text>
        <Text style={styles.item}>Breakfast: {guide.nutritionPlan.sampleDay.breakfast}</Text>
        <Text style={styles.item}>Lunch: {guide.nutritionPlan.sampleDay.lunch}</Text>
        <Text style={styles.item}>Dinner: {guide.nutritionPlan.sampleDay.dinner}</Text>
        <Text style={styles.item}>Snacks: {guide.nutritionPlan.sampleDay.snacks}</Text>
        <Text style={styles.label}>Swaps</Text>
        {guide.nutritionPlan.swaps.map((s, i) => (
          <Text key={i} style={styles.item}>{s.from} -> {s.to}</Text>
        ))}
        <Text style={styles.label}>Grocery staples</Text>
        <Text style={styles.item}>{guide.nutritionPlan.groceryStaples.join(", ")}</Text>

        <Text style={styles.h2}>Your daily blueprint</Text>
        {guide.dailyBlueprint.map((b, i) => (
          <Text key={i} style={styles.item}>{b.time}  {b.activity}</Text>
        ))}

        <Text style={styles.h2}>Sleep and stress recovery</Text>
        <Text style={styles.para}>{guide.sleepAndStress.summary}</Text>
        {guide.sleepAndStress.protocol.map((p, i) => (
          <Text key={i} style={styles.item}>- {p}</Text>
        ))}

        <Text style={styles.h2}>The 10-minute fallback</Text>
        <Text style={styles.para}>{guide.tenMinutePlan.summary}</Text>
        {guide.tenMinutePlan.movements.map((m, i) => (
          <Text key={i} style={styles.item}>- {m.name}: {m.detail}</Text>
        ))}

        <Text style={styles.h2}>When it gets hard</Text>
        {guide.troubleshooting.map((t, i) => (
          <View key={i}>
            <Text style={styles.item}>{t.problem}</Text>
            <Text style={styles.muted}>{t.fix}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Weekly recalibration</Text>
        <Text style={styles.para}>{guide.recalibration}</Text>
        <Text style={styles.para}>{guide.closing}</Text>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 2: Now run the full type/lint/build (both consumers are updated)**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: clean. If tsc reports a residual reference to an old field (e.g. `goalFocus`, `nutritionReset`, `sessions`, `note`, `dailyTenMinute`), fix that reference to the new schema; do not reintroduce old fields.

- [ ] **Step 3: Commit**

```bash
git add components/guide/guide-pdf.tsx
git commit -m "feat: render the expanded guide in the PDF"
```

---

## Task 6: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full unit suite + typecheck + lint + build**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all PASS, clean build.

- [ ] **Step 2: Run the e2e suite**

Run: `npm run e2e`
Expected: BOTH tests pass. The purchase test still finds the `<h1>` ("The Second Wind Protocol"), the "Your 8-week plan" section, the "Download your PDF" link, and the PDF endpoint still returns `application/pdf` (now rendering the richer document via the stub). If a stale dev server without the hermetic env is on :3000, stop it first so Playwright starts a fresh one.

- [ ] **Step 3: (Optional, real generation) sanity check**

This is optional and uses a real Claude call (costs tokens). With the real `ANTHROPIC_API_KEY` present and Supabase configured, run the funnel once in the browser and confirm a generated (non-stub) guide validates and renders. If skipped, note it.

- [ ] **Step 4: Commit any e2e selector fixes (only if needed)**

```bash
git add -A
git commit -m "test: keep e2e green against the expanded guide"
```

(If Step 1 and Step 2 passed with no changes, there is nothing to commit here.)

---

## Self-Review

**Spec coverage (Plan 1 section):**
- Expanded GuideDoc (yourSituation, strategy, weeks with workouts/exercises sets/reps/rest/cues/progression, habit, checkpoint, nutritionPlan with sampleDay/swaps/groceryStaples, dailyBlueprint, sleepAndStress, tenMinutePlan, next7Days, troubleshooting, recalibration, outcomes, closing) -> Task 1. Covered.
- Prompt rewrite for specificity + calibration to level/barrier, references real answers, no em-dashes -> Task 3. Covered.
- Stay on Sonnet 4.6, raise max_tokens -> Task 3. Covered.
- Expand the deterministic stub -> Task 2. Covered.
- Re-render richer doc in view (design-taste-frontend-v1) and PDF -> Tasks 4, 5. Covered.
- generate.ts/orders.ts/start.ts unchanged -> not touched. Covered.
- Fully testable offline (stub + zod), e2e stays green -> Tasks 1-3 + Task 6. Covered.

**Placeholder scan:** No TBD/placeholder steps; every code step has full content. The intentional "build is red between Task 1 and Task 5" is documented up front with explicit per-task run commands.

**Type consistency:** `GuideDoc`/`GuideWeek` (and nested `Exercise`/`Workout`) defined in Task 1 are used consistently by the fixture (Task 2), view (Task 4), and PDF (Task 5). Field names (`yourSituation`, `strategy`, `weeks[].theme/focus/workouts/nutritionFocus/habit/checkpoint`, `workouts[].day/title/exercises`, `exercises[].name/sets/reps/rest/cues/progression`, `nutritionPlan.principles/sampleDay/swaps/groceryStaples`, `dailyBlueprint[].time/activity`, `sleepAndStress.summary/protocol`, `tenMinutePlan.summary/movements[].name/detail`, `next7Days[].day/action`, `troubleshooting[].problem/fix`, `recalibration`, `outcomes`, `closing`) match across the schema, fixture, view, and PDF. The fixture and the schema test independently construct valid objects of the same shape. No naming drift found.
