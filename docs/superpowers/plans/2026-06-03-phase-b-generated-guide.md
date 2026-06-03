# Phase B - Per-user Generated Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture the ephemeral scan answers, regenerate the result server-side, generate a personalized 8-week protocol with the Claude API, store it, and deliver it on a tokenized URL with a PDF download and a conversion-oriented "building" screen.

**Architecture:** The result page's buy button calls a Next.js Server Action (`startGuideGeneration`) that validates answers, creates an `orders` record (`status='generating'`), schedules generation in the background via `after()` on Fluid Compute, and redirects to `/guide/[token]`. That page shows a building screen (testimonials + placeholder transformation photos) that polls a status endpoint until the guide is `ready`, then renders it. Generation (`generateGuide`) recomputes the deterministic `ScanResult`, prompts Claude with a cached system prompt + structured-output tool, validates with zod, and persists. A deterministic stub path runs when no API key is present, and an in-memory order store runs when Supabase env is absent, so the whole flow is testable offline. `startGuideGeneration`/`generateGuide` are the seam Phase C's Stripe webhook will reuse.

**Tech Stack:** Next.js 16 (App Router, Server Actions, `after()`), React 19, TypeScript, Tailwind v4, Supabase Postgres (`@supabase/supabase-js`), Claude API (`@anthropic-ai/sdk`, `claude-sonnet-4-6`), `zod` (schema + JSON-schema), `@react-pdf/renderer` (PDF). UI work goes through the `design-taste-frontend-v1` skill, staying in the locked dark-monitor theme and `monitor-*` tokens. No em-dashes in user-facing copy.

**Spec:** `docs/superpowers/specs/2026-06-03-phase-b-generated-guide-design.md`

**Critical Next 16 notes (verify against `node_modules/next/dist/docs/` if anything errors):**
- Dynamic route params are async: `params: Promise<{ token: string }>`, must `await`.
- `after` is imported from `next/server` and works in Server Components, Route Handlers, and Server Actions.
- Server Actions live in a file with a top-level `"use server"` directive; importing such a file into a Client Component wires the action.

---

## File Structure

**New files**
- `lib/guide/schema.ts` - `GuideDocSchema` (zod) + types, `AnswersSchema`. Source of truth for the guide shape.
- `lib/guide/fixture.ts` - `buildFixtureGuide(result)`, a deterministic schema-valid guide for stub/tests.
- `lib/guide/prompt.ts` - `buildGuidePrompt(result, answers)` -> `{ system, user }`. Pure.
- `lib/supabase/server.ts` - server-only Supabase client (service role).
- `lib/guide/orders.ts` - order store with two backends (in-memory when Supabase env absent, Supabase otherwise).
- `lib/guide/model.ts` - thin Anthropic wrapper, `requestGuide(system, user)`.
- `lib/guide/generate.ts` - `generateGuide(token)` orchestration (stub vs. model, validate, persist).
- `lib/guide/start.ts` - `startGuideGeneration(answers)` Server Action (the Stripe seam).
- `lib/guide/testimonials.ts` - fixed testimonial + transformation placeholder data.
- `app/api/guide/[token]/status/route.ts` - status polling endpoint.
- `app/guide/[token]/page.tsx` - Server Component: ready -> guide, else building screen (+ auto-retry).
- `components/guide/guide-building-screen.tsx` - waiting/conversion surface (client; polls).
- `components/guide/guide-view.tsx` - renders the guide in the dark-monitor theme.
- `components/guide/guide-pdf.tsx` - `@react-pdf/renderer` document.
- `app/guide/[token]/pdf/route.ts` - PDF download.
- `supabase/migrations/<timestamp>_orders.sql` - table + RLS.
- `.env.example` - documented env vars.
- Tests: `lib/guide/schema.test.ts`, `lib/guide/fixture.test.ts`, `lib/guide/prompt.test.ts`, `lib/guide/orders.test.ts`, `lib/guide/generate.test.ts`.

**Modified files**
- `components/checkout-button.tsx` - call the action, "building" state, redirect; keep placeholder when no answers.
- `components/guide-pitch.tsx` - accept `answers`, pass to both `CheckoutButton`s.
- `app/scan/page.tsx` - pass `answers` to `GuidePitch`.
- `app/terms/page.tsx` - testimonials/imagery disclosure.
- `playwright.config.ts` - `GUIDE_STUB=1` in the dev web server env.
- `e2e/smoke.spec.ts` - add a purchase -> guide test.

> `report-card.tsx` does **not** render a buy button (only an in-page "see plan" scroll), so it needs no change. The standalone `app/guide/page.tsx` renders `GuidePitch` with no result/answers; `CheckoutButton` must keep its placeholder behavior there.

---

## Task 1: Dependencies and env scaffolding

**Files:**
- Modify: `package.json` (via npm)
- Create: `.env.example`

- [ ] **Step 1: Install runtime dependencies**

Run:
```bash
npm i @anthropic-ai/sdk @supabase/supabase-js @react-pdf/renderer zod
```
Expected: packages added to `dependencies`; install completes without errors. (`server-only` ships with Next, no install needed.)

- [ ] **Step 2: Create `.env.example`**

Create `.env.example`:
```bash
# Claude API for guide generation. If unset, generation uses the offline stub.
ANTHROPIC_API_KEY=

# Supabase. If either is unset, orders use an in-process in-memory store
# (fine for local dev/e2e; NOT viable in serverless production).
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Optional: force the offline stub generator even when ANTHROPIC_API_KEY is set.
GUIDE_STUB=
```

- [ ] **Step 3: Verify the build still passes**

Run: `npx tsc --noEmit`
Expected: no errors (no source changes yet, just deps).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add guide-generation deps and env example"
```

---

## Task 2: GuideDoc and Answers schemas

**Files:**
- Create: `lib/guide/schema.ts`
- Test: `lib/guide/schema.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/guide/schema.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/guide/schema.test.ts`
Expected: FAIL - cannot import from `@/lib/guide/schema` (module not found).

- [ ] **Step 3: Write the schema**

Create `lib/guide/schema.ts`:
```ts
import { z } from "zod";

export const GuideWeekSchema = z.object({
  week: z.number().int().min(1).max(8),
  focus: z.string().min(1),
  sessions: z.array(z.string().min(1)).min(1),
  note: z.string().min(1),
});

export const GuideDocSchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  goalFocus: z.string().min(1),
  weeks: z.array(GuideWeekSchema).length(8),
  nutritionReset: z.object({
    summary: z.string().min(1),
    eatList: z.array(z.string().min(1)).min(1),
    rhythm: z.array(z.string().min(1)).min(1),
  }),
  sleepStress: z.object({
    summary: z.string().min(1),
    practices: z.array(z.string().min(1)).min(1),
  }),
  dailyTenMinute: z.object({
    summary: z.string().min(1),
    movements: z.array(z.string().min(1)).min(1),
  }),
  recalibration: z.string().min(1),
  outcomes: z.array(z.string().min(1)).min(1),
});

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
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/guide/schema.ts lib/guide/schema.test.ts
git commit -m "feat: GuideDoc and Answers zod schemas"
```

---

## Task 3: Deterministic fixture guide

**Files:**
- Create: `lib/guide/fixture.ts`
- Test: `lib/guide/fixture.test.ts`

This produces a valid, lightly personalized `GuideDoc` from a `ScanResult`. It powers the offline stub and the tests, so generation never needs the network.

- [ ] **Step 1: Write the failing test**

Create `lib/guide/fixture.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/guide/fixture.test.ts`
Expected: FAIL - module not found.

- [ ] **Step 3: Write the fixture builder**

Create `lib/guide/fixture.ts`:
```ts
import type { ScanResult } from "@/lib/longevity";
import { PRODUCT } from "@/lib/product";
import type { GuideDoc, GuideWeek } from "@/lib/guide/schema";

// Deterministic, offline guide derived from the scan result. Used as the stub
// generator (no API key) and in tests. Mirrors the GuideDoc contract so the
// rest of the pipeline is exercised without a network call.
export function buildFixtureGuide(result: ScanResult): GuideDoc {
  const risks = result.topRisks.length
    ? result.topRisks.map((r) => r.category)
    : ["Physical activity", "Diet quality", "Sleep"];
  const goalFocus = result.outcomes[0]?.label ?? "Add years back to your life";

  const weeks: GuideWeek[] = Array.from({ length: 8 }, (_, i) => {
    const target = risks[i % risks.length];
    return {
      week: i + 1,
      focus: `Week ${i + 1}: ${target}`,
      sessions: [
        `Primary work on ${target.toLowerCase()}`,
        "A short conditioning finisher",
      ],
      note: `Hold the change from week ${Math.max(1, i)} while you add this one.`,
    };
  });

  return {
    title: PRODUCT.name,
    intro: `This plan is built from your scan. It leads with ${risks[0].toLowerCase()}, the biggest drag on your projection, then works down your list in order of impact.`,
    goalFocus,
    weeks,
    nutritionReset: {
      summary: "No counting. A short list of foods and a daily rhythm you can repeat.",
      eatList: ["Protein at every meal", "Vegetables you actually like", "Whole-food carbs around training"],
      rhythm: ["Three meals, no grazing", "Stop eating 3 hours before bed"],
    },
    sleepStress: {
      summary: "Get your nights and your nervous system back first; everything else gets easier.",
      practices: ["A fixed wake time, 7 days a week", "Ten minutes of wind-down with no screens", "One daily walk outside"],
    },
    dailyTenMinute: {
      summary: "Short enough that 'no time' stops being the reason.",
      movements: ["2 minutes easy mobility", "6 minutes of strength work", "2 minutes of breathing"],
    },
    recalibration: "Each week the plan tightens as your numbers move. Repeat what worked, replace what did not.",
    outcomes: result.outcomes.map((o) => o.label),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/guide/fixture.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/guide/fixture.ts lib/guide/fixture.test.ts
git commit -m "feat: deterministic fixture guide builder"
```

---

## Task 4: Prompt builder

**Files:**
- Create: `lib/guide/prompt.ts`
- Test: `lib/guide/prompt.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/guide/prompt.test.ts`:
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

  it("system prompt states the delivery contract and the no-em-dash rule", () => {
    expect(system).toMatch(/8-week/i);
    expect(system).toMatch(/em-dash/i);
    expect(system).toMatch(/emit_guide|JSON|structured/i);
  });

  it("user prompt carries the personalization signals", () => {
    expect(user).toMatch(/Tobacco use|tobacco/i); // top risk category
    expect(user).toMatch(/lose body fat|fat/i); // goal
    expect(user).toMatch(/never have the time|time/i); // activity_barrier label
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/guide/prompt.test.ts`
Expected: FAIL - module not found.

- [ ] **Step 3: Write the prompt builder**

Create `lib/guide/prompt.ts`:
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

// Long, cache-friendly instructions. Cached by the model wrapper. Keep this
// stable across users so the prompt cache hits.
export function buildSystemPrompt(): string {
  const included = INCLUDED.map((i) => `- ${i.label}: ${i.note}`).join("\n");
  return [
    `You are an expert strength and longevity coach writing "${PRODUCT.name}", a personalized 8-week protocol for one client, based on their lifestyle scan.`,
    `Return your answer ONLY by calling the emit_guide tool with structured JSON. Do not write prose outside the tool call.`,
    ``,
    `The protocol must deliver every item the client was promised:`,
    included,
    ``,
    `Rules:`,
    `- Exactly 8 weeks. Order the weeks so the client's highest-impact modifiable risks are addressed first, then down the list.`,
    `- Shape the 10-minute daily routine around the client's stated training barrier.`,
    `- Be concrete and practical. No medical claims, no calorie math, no diagnoses.`,
    `- Plain, direct, encouraging tone.`,
    `- Never use em-dashes (no "-" long dash characters). Use commas, periods, or hyphens.`,
  ].join("\n");
}

export function buildUserPrompt(result: ScanResult, answers: Answers): string {
  const goal = result.primaryGoal ? GOAL_LABEL[result.primaryGoal] ?? result.primaryGoal : "General longevity";
  const barrier = optionLabel("activity_barrier", answers.activity_barrier);
  const topRisks = result.topRisks
    .map((r, i) => `${i + 1}. ${r.category} (${r.answerLabel}) - ${r.detail}`)
    .join("\n");
  const strengths = result.strengths.map((s) => `- ${s.category}: ${s.answerLabel}`).join("\n") || "- None notable";
  const levels = result.factors.map((f) => `- ${f.category}: ${f.answerLabel}`).join("\n");
  const outcomes = result.outcomes.map((o) => `- ${o.label}`).join("\n");

  return [
    `Client profile:`,
    `- Age: ${result.currentAge}`,
    `- Primary goal: ${goal}`,
    barrier ? `- Training barrier: ${barrier}` : `- Training barrier: not specified`,
    ``,
    `Highest-impact modifiable risks (attack in this order):`,
    topRisks || "None notable",
    ``,
    `Already working in their favor:`,
    strengths,
    ``,
    `All scored factors and the client's answers:`,
    levels,
    ``,
    `Promised outcomes to deliver against:`,
    outcomes,
    ``,
    `Write the personalized 8-week protocol now via emit_guide.`,
  ].join("\n");
}

export function buildGuidePrompt(result: ScanResult, answers: Answers): { system: string; user: string } {
  return { system: buildSystemPrompt(), user: buildUserPrompt(result, answers) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/guide/prompt.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/guide/prompt.ts lib/guide/prompt.test.ts
git commit -m "feat: guide generation prompt builder"
```

---

## Task 5: Supabase migration and server client

**Files:**
- Create: `supabase/migrations/20260603120000_orders.sql`
- Create: `lib/supabase/server.ts`

No automated test (DB/infra); verified by `tsc` and used by later tasks. The in-memory store (Task 6) is what runs in dev/tests.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260603120000_orders.sql`:
```sql
create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  answers jsonb not null,
  status text not null default 'generating'
    check (status in ('generating', 'ready', 'failed')),
  guide jsonb,
  model text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- All access is server-side via the service role (which bypasses RLS). Enable
-- RLS with no public policies as defense-in-depth: the token is the only secret.
alter table public.orders enable row level security;
```

- [ ] **Step 2: Write the server client**

Create `lib/supabase/server.ts`:
```ts
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client. Server-only; never import into client components.
export function supabaseServer(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260603120000_orders.sql lib/supabase/server.ts
git commit -m "feat: orders table migration and server-only supabase client"
```

> Provisioning note for the operator: create a Supabase project, run this migration (`supabase db push` or the SQL editor), and set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. Until then the app uses the in-memory store from Task 6.

---

## Task 6: Orders store (in-memory + Supabase)

**Files:**
- Create: `lib/guide/orders.ts`
- Test: `lib/guide/orders.test.ts`

The store picks its backend at call time: in-memory when Supabase env is absent (dev/tests/e2e), Supabase otherwise. Tests run against the in-memory backend with no mocks.

- [ ] **Step 1: Write the failing test**

Create `lib/guide/orders.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  newToken,
  createOrder,
  getOrderByToken,
  markReady,
  markFailed,
  __clearMemory,
} from "@/lib/guide/orders";
import { buildFixtureGuide } from "@/lib/guide/fixture";
import { computeResult } from "@/lib/longevity";

// No Supabase env in the test process -> in-memory backend.
beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  __clearMemory();
});

const answers = { age: 40, smoking: "never", activity: "none", goal: "fat" };

describe("orders store (in-memory)", () => {
  it("newToken returns distinct url-safe tokens", () => {
    const a = newToken();
    const b = newToken();
    expect(a).not.toEqual(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("creates an order in 'generating' and reads it back", async () => {
    const order = await createOrder(answers);
    expect(order.status).toBe("generating");
    const fetched = await getOrderByToken(order.token);
    expect(fetched?.answers).toEqual(answers);
  });

  it("marks an order ready with a guide", async () => {
    const order = await createOrder(answers);
    const guide = buildFixtureGuide(computeResult(answers));
    await markReady(order.token, guide, "stub");
    const fetched = await getOrderByToken(order.token);
    expect(fetched?.status).toBe("ready");
    expect(fetched?.guide?.title).toBe(guide.title);
    expect(fetched?.model).toBe("stub");
  });

  it("marks an order failed with an error", async () => {
    const order = await createOrder(answers);
    await markFailed(order.token, "boom");
    const fetched = await getOrderByToken(order.token);
    expect(fetched?.status).toBe("failed");
    expect(fetched?.error).toBe("boom");
  });

  it("returns null for an unknown token", async () => {
    expect(await getOrderByToken("nope")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/guide/orders.test.ts`
Expected: FAIL - module not found.

- [ ] **Step 3: Write the orders store**

Create `lib/guide/orders.ts`:
```ts
import { randomBytes } from "node:crypto";
import type { Answers } from "@/lib/longevity";
import type { GuideDoc } from "@/lib/guide/schema";

export type OrderStatus = "generating" | "ready" | "failed";

export interface OrderRow {
  id: string;
  token: string;
  answers: Answers;
  status: OrderStatus;
  guide: GuideDoc | null;
  model: string | null;
  error: string | null;
  created_at: string;
}

export function newToken(): string {
  return randomBytes(24).toString("base64url");
}

function memoryEnabled(): boolean {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// In-process store for local dev, tests, and e2e. NOT shared across serverless
// instances; production must configure Supabase.
const memory = new Map<string, OrderRow>();
export function __clearMemory(): void {
  memory.clear();
}

// Imported lazily so the in-memory path never pulls in the server-only client.
async function client() {
  const { supabaseServer } = await import("@/lib/supabase/server");
  return supabaseServer();
}

export async function createOrder(answers: Answers): Promise<OrderRow> {
  const token = newToken();
  if (memoryEnabled()) {
    const row: OrderRow = {
      id: token,
      token,
      answers,
      status: "generating",
      guide: null,
      model: null,
      error: null,
      created_at: new Date().toISOString(),
    };
    memory.set(token, row);
    return row;
  }
  const { data, error } = await (await client())
    .from("orders")
    .insert({ token, answers, status: "generating" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as OrderRow;
}

export async function getOrderByToken(token: string): Promise<OrderRow | null> {
  if (memoryEnabled()) return memory.get(token) ?? null;
  const { data, error } = await (await client())
    .from("orders")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as OrderRow) ?? null;
}

export async function markReady(token: string, guide: GuideDoc, model: string): Promise<void> {
  if (memoryEnabled()) {
    const row = memory.get(token);
    if (row) {
      row.status = "ready";
      row.guide = guide;
      row.model = model;
    }
    return;
  }
  const { error } = await (await client())
    .from("orders")
    .update({ status: "ready", guide, model, updated_at: new Date().toISOString() })
    .eq("token", token);
  if (error) throw new Error(error.message);
}

export async function markFailed(token: string, message: string): Promise<void> {
  if (memoryEnabled()) {
    const row = memory.get(token);
    if (row) {
      row.status = "failed";
      row.error = message;
    }
    return;
  }
  const { error } = await (await client())
    .from("orders")
    .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
    .eq("token", token);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/guide/orders.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/guide/orders.ts lib/guide/orders.test.ts
git commit -m "feat: orders store with in-memory and supabase backends"
```

---

## Task 7: Claude model wrapper

**Files:**
- Create: `lib/guide/model.ts`

Thin SDK wrapper, no unit test (it would only test the SDK). It is mocked in Task 8's tests. Uses a cached system prompt and a structured-output tool whose schema is derived from `GuideDocSchema`.

- [ ] **Step 1: Write the wrapper**

Create `lib/guide/model.ts`:
```ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { GuideDocSchema } from "@/lib/guide/schema";

export const GUIDE_MODEL = "claude-sonnet-4-6";

// zod v4 -> JSON Schema for the tool's input_schema.
const GUIDE_JSON_SCHEMA = z.toJSONSchema(GuideDocSchema) as Anthropic.Tool["input_schema"];

// Calls Claude with a cached system prompt and forces structured output via a
// single tool. Returns the raw tool input (validated by the caller).
export async function requestGuide(system: string, user: string): Promise<unknown> {
  const anthropic = new Anthropic();
  const res = await anthropic.messages.create({
    model: GUIDE_MODEL,
    max_tokens: 8000,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    tools: [
      {
        name: "emit_guide",
        description: "Return the personalized 8-week protocol as structured data.",
        input_schema: GUIDE_JSON_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "emit_guide" },
    messages: [{ role: "user", content: user }],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Model did not return a guide");
  }
  return block.input;
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors. If `z.toJSONSchema` is reported missing, the installed zod is < v4: use context7 ("use context7", library `zod`) to confirm the v4 JSON-schema API and adjust the import, or pin zod v4.

- [ ] **Step 3: Commit**

```bash
git add lib/guide/model.ts
git commit -m "feat: anthropic guide model wrapper with cached prompt and tool output"
```

---

## Task 8: Generation orchestration

**Files:**
- Create: `lib/guide/generate.ts`
- Test: `lib/guide/generate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/guide/generate.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createOrder, getOrderByToken, __clearMemory } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";
import { buildFixtureGuide } from "@/lib/guide/fixture";
import { computeResult } from "@/lib/longevity";

// Mock only the network wrapper; orders run against the in-memory store.
vi.mock("@/lib/guide/model", () => ({
  GUIDE_MODEL: "claude-sonnet-4-6",
  requestGuide: vi.fn(),
}));
import { requestGuide } from "@/lib/guide/model";

const answers = { age: 50, smoking: "heavy", activity: "none", diet: "poor", goal: "fat" };
const env = { ...process.env };

beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  __clearMemory();
  vi.clearAllMocks();
});
afterEach(() => {
  process.env = { ...env };
});

describe("generateGuide", () => {
  it("uses the offline stub when no API key is set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const order = await createOrder(answers);
    await generateGuide(order.token);
    const done = await getOrderByToken(order.token);
    expect(done?.status).toBe("ready");
    expect(done?.model).toBe("stub");
    expect(done?.guide?.weeks).toHaveLength(8);
    expect(requestGuide).not.toHaveBeenCalled();
  });

  it("calls the model when an API key is present and persists the result", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    delete process.env.GUIDE_STUB;
    (requestGuide as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildFixtureGuide(computeResult(answers))
    );
    const order = await createOrder(answers);
    await generateGuide(order.token);
    const done = await getOrderByToken(order.token);
    expect(requestGuide).toHaveBeenCalledOnce();
    expect(done?.status).toBe("ready");
    expect(done?.model).toBe("claude-sonnet-4-6");
  });

  it("marks the order failed when the model returns an invalid guide", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    delete process.env.GUIDE_STUB;
    (requestGuide as ReturnType<typeof vi.fn>).mockResolvedValue({ not: "a guide" });
    const order = await createOrder(answers);
    await generateGuide(order.token);
    const done = await getOrderByToken(order.token);
    expect(done?.status).toBe("failed");
    expect(done?.error).toBeTruthy();
  });

  it("is a no-op when the order is already ready", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const order = await createOrder(answers);
    await generateGuide(order.token); // -> ready via stub
    await generateGuide(order.token); // second run should not throw or change state
    const done = await getOrderByToken(order.token);
    expect(done?.status).toBe("ready");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/guide/generate.test.ts`
Expected: FAIL - cannot import `generateGuide`.

- [ ] **Step 3: Write the orchestrator**

Create `lib/guide/generate.ts`:
```ts
import { computeResult, type Answers } from "@/lib/longevity";
import { GuideDocSchema, type GuideDoc } from "@/lib/guide/schema";
import { buildGuidePrompt } from "@/lib/guide/prompt";
import { buildFixtureGuide } from "@/lib/guide/fixture";
import { getOrderByToken, markReady, markFailed } from "@/lib/guide/orders";
import { requestGuide, GUIDE_MODEL } from "@/lib/guide/model";

function useStub(): boolean {
  return !process.env.ANTHROPIC_API_KEY || process.env.GUIDE_STUB === "1";
}

async function produceGuide(answers: Answers): Promise<{ guide: GuideDoc; model: string }> {
  const result = computeResult(answers);
  if (useStub()) {
    return { guide: buildFixtureGuide(result), model: "stub" };
  }
  const { system, user } = buildGuidePrompt(result, answers);
  const raw = await requestGuide(system, user);
  return { guide: GuideDocSchema.parse(raw), model: GUIDE_MODEL };
}

// Idempotent: safe to call again on a failed or stuck order; no-op once ready.
export async function generateGuide(token: string): Promise<void> {
  const order = await getOrderByToken(token);
  if (!order || order.status === "ready") return;
  try {
    const { guide, model } = await produceGuide(order.answers);
    await markReady(token, guide, model);
  } catch (e) {
    await markFailed(token, e instanceof Error ? e.message : String(e));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/guide/generate.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: all engine + guide tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/guide/generate.ts lib/guide/generate.test.ts
git commit -m "feat: guide generation orchestration with stub and validation"
```

---

## Task 9: Start-generation Server Action

**Files:**
- Create: `lib/guide/start.ts`

The Stripe seam. No unit test (Server Action + `after()`); covered by the e2e test in Task 14.

- [ ] **Step 1: Write the action**

Create `lib/guide/start.ts`:
```ts
"use server";

import { after } from "next/server";
import { AnswersSchema } from "@/lib/guide/schema";
import { createOrder } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";
import type { Answers } from "@/lib/longevity";

// Entry point for turning a completed scan into a generated guide. Today it is
// called by the buy button; in Phase C the Stripe webhook calls the same path
// after a verified payment.
export async function startGuideGeneration(answers: Answers): Promise<{ token: string }> {
  const parsed = AnswersSchema.parse(answers) as Answers;
  const order = await createOrder(parsed);
  after(async () => {
    await generateGuide(order.token);
  });
  return { token: order.token };
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/guide/start.ts
git commit -m "feat: startGuideGeneration server action (stripe seam)"
```

---

## Task 10: Status endpoint and guide page

**Files:**
- Create: `app/api/guide/[token]/status/route.ts`
- Create: `app/guide/[token]/page.tsx`

The page renders the guide when ready, otherwise the building screen, and auto-retries failed or stale generations in the background. (Building screen + guide view components are built in Task 11; this task wires the routes and a temporary minimal render so the page compiles; Task 11 replaces the placeholders.)

- [ ] **Step 1: Write the status route**

Create `app/api/guide/[token]/status/route.ts`:
```ts
import { getOrderByToken } from "@/lib/guide/orders";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const order = await getOrderByToken(token);
  if (!order) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ status: order.status });
}
```

- [ ] **Step 2: Write the guide page (with temporary inline render)**

Create `app/guide/[token]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getOrderByToken, type OrderRow } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";

export const dynamic = "force-dynamic";

function isStale(order: OrderRow): boolean {
  return Date.now() - new Date(order.created_at).getTime() > 90_000;
}

export default async function GuideTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  if (order.status === "ready" && order.guide) {
    // Replaced by <GuideView /> in Task 11.
    return <pre>{JSON.stringify(order.guide, null, 2)}</pre>;
  }

  // Auto-retry a failed or stuck generation in the background (idempotent).
  if (order.status === "failed" || isStale(order)) {
    after(async () => {
      await generateGuide(token);
    });
  }

  // Replaced by <GuideBuildingScreen /> in Task 11.
  return <p>Building your protocol...</p>;
}
```

- [ ] **Step 3: Verify it compiles and runs**

Run: `npx tsc --noEmit`
Expected: no errors. (Functional verification happens via e2e in Task 14.)

- [ ] **Step 4: Commit**

```bash
git add app/api/guide/[token]/status/route.ts app/guide/[token]/page.tsx
git commit -m "feat: guide status endpoint and tokenized guide page"
```

---

## Task 11: Building screen, testimonials, and guide view

**Files:**
- Create: `lib/guide/testimonials.ts`
- Create: `components/guide/guide-building-screen.tsx`
- Create: `components/guide/guide-view.tsx`
- Modify: `app/guide/[token]/page.tsx` (swap the placeholders)

> UI sub-skill: build/refine these with `design-taste-frontend-v1`, staying in the locked dark-monitor theme (`monitor-*` tokens), mono for numbers, no em-dashes. The code below is a correct, on-theme baseline to start from.

- [ ] **Step 1: Write the testimonials/transformations data**

Create `lib/guide/testimonials.ts`:
```ts
export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

export interface Transformation {
  weeks: number;
  caption: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { quote: "I stopped dreading mornings. The plan was short enough that I actually did it.", name: "Daniel R.", detail: "Down 7 kg in 8 weeks" },
  { quote: "My scan scared me. This gave me something to do about it.", name: "Priya M.", detail: "Resting heart rate down 11 bpm" },
  { quote: "First program I have ever finished. The weekly recalibration kept it honest.", name: "Marcus T.", detail: "Sleeping a full hour longer" },
  { quote: "The 10-minute routine fit a life with two kids and a job.", name: "Elena K.", detail: "Back to lifting after years off" },
];

// Placeholder transformation slots. Real before/after assets are dropped in
// later (drop images into /public and render them in place of the slots).
export const TRANSFORMATIONS: Transformation[] = [
  { weeks: 8, caption: "8-week transformation" },
  { weeks: 12, caption: "12-week transformation" },
  { weeks: 8, caption: "8-week transformation" },
];
```

- [ ] **Step 2: Write the building screen**

Create `components/guide/guide-building-screen.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TESTIMONIALS, TRANSFORMATIONS } from "@/lib/guide/testimonials";

export function GuideBuildingScreen({
  token,
  failed,
}: {
  token: string;
  failed?: boolean;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/guide/${token}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const { status } = (await res.json()) as { status: string };
        if (status === "ready") router.refresh();
      } catch {
        // transient; keep polling
      }
    }, 2500);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [token, router]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 pt-20 pb-24">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
          {failed ? "Rebuilding your protocol" : "Building your protocol"}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-monitor-fg md:text-4xl">
          Your Second Wind Protocol is being written
        </h1>
        <p className="max-w-[58ch] text-base leading-relaxed text-monitor-muted">
          We are turning your scan into a day-by-day plan that targets your
          highest-impact risks first. This usually takes under a minute.
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-monitor-line">
          <div
            className="h-full bg-monitor-accent transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(95, 20 + elapsed * 4)}%` }}
          />
        </div>
        <span className="font-mono text-xs text-monitor-muted">
          Elapsed {elapsed}s
        </span>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          Real results from the protocol
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TRANSFORMATIONS.map((t, i) => (
            <div
              key={i}
              className="flex aspect-[3/4] flex-col justify-end rounded-lg border border-monitor-line bg-monitor-panel p-4"
            >
              {/* Placeholder slot. Replace with a real before/after image. */}
              <span className="font-mono text-xs text-monitor-muted">{t.caption}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <ul className="flex flex-col gap-4">
          {TESTIMONIALS.map((t) => (
            <li
              key={t.name}
              className="rounded-lg border border-monitor-line bg-monitor-panel p-5"
            >
              <p className="text-base leading-relaxed text-monitor-fg">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-2 font-mono text-xs text-monitor-muted">
                {t.name}, {t.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Write the guide view**

Create `components/guide/guide-view.tsx`:
```tsx
import type { GuideDoc } from "@/lib/guide/schema";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span aria-hidden className="font-mono text-monitor-accent">
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
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 pt-20 pb-24">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
          Your protocol is ready
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-monitor-fg">
          {guide.title}
        </h1>
        <p className="max-w-[60ch] text-lg leading-relaxed text-monitor-muted">
          {guide.intro}
        </p>
        <a
          href={`/guide/${token}/pdf`}
          className="mt-2 inline-flex w-fit items-center gap-2 rounded-md bg-monitor-accent px-5 py-3 text-sm font-semibold text-monitor-bg hover:bg-monitor-accent/90"
        >
          Download your PDF
        </a>
      </div>

      <Section title="What these 8 weeks deliver">
        <List items={guide.outcomes} />
      </Section>

      <Section title="Your 8-week plan">
        <div className="flex flex-col gap-3">
          {guide.weeks.map((w) => (
            <div
              key={w.week}
              className="rounded-lg border border-monitor-line bg-monitor-panel p-5"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xl tracking-tighter text-monitor-accent">
                  {String(w.week).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-monitor-fg">{w.focus}</span>
              </div>
              <ul className="mt-3 flex flex-col gap-1">
                {w.sessions.map((s, i) => (
                  <li key={i} className="text-sm leading-relaxed text-monitor-muted">
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm leading-relaxed text-monitor-muted">{w.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="The metabolic reset">
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.nutritionReset.summary}</p>
        <List items={guide.nutritionReset.eatList} />
        <List items={guide.nutritionReset.rhythm} />
      </Section>

      <Section title="Sleep and stress recovery">
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.sleepStress.summary}</p>
        <List items={guide.sleepStress.practices} />
      </Section>

      <Section title="The 10-minute daily routine">
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.dailyTenMinute.summary}</p>
        <List items={guide.dailyTenMinute.movements} />
      </Section>

      <Section title="Weekly recalibration">
        <p className="text-sm leading-relaxed text-monitor-fg">{guide.recalibration}</p>
      </Section>
    </main>
  );
}
```

- [ ] **Step 4: Swap the placeholders in the guide page**

In `app/guide/[token]/page.tsx`, add the imports:
```tsx
import { GuideBuildingScreen } from "@/components/guide/guide-building-screen";
import { GuideView } from "@/components/guide/guide-view";
```
Replace the ready-state placeholder:
```tsx
    // Replaced by <GuideView /> in Task 11.
    return <pre>{JSON.stringify(order.guide, null, 2)}</pre>;
```
with:
```tsx
    return <GuideView guide={order.guide} token={token} />;
```
Replace the building-state placeholder:
```tsx
  // Replaced by <GuideBuildingScreen /> in Task 11.
  return <p>Building your protocol...</p>;
```
with:
```tsx
  return <GuideBuildingScreen token={token} failed={order.status === "failed"} />;
```

- [ ] **Step 5: Verify types and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/guide/testimonials.ts components/guide/ app/guide/[token]/page.tsx
git commit -m "feat: guide building screen, testimonials, and guide view"
```

---

## Task 12: PDF document and download route

**Files:**
- Create: `components/guide/guide-pdf.tsx`
- Create: `app/guide/[token]/pdf/route.ts`

- [ ] **Step 1: Write the PDF document**

Create `components/guide/guide-pdf.tsx`:
```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GuideDoc } from "@/lib/guide/schema";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#0b1417", lineHeight: 1.5 },
  h1: { fontSize: 22, marginBottom: 8 },
  h2: { fontSize: 13, marginTop: 18, marginBottom: 6, color: "#0a8f7d" },
  intro: { marginBottom: 8, color: "#3a4a4f" },
  weekTitle: { fontSize: 12, marginTop: 8 },
  item: { marginBottom: 2 },
});

export function GuidePdfDocument({ guide }: { guide: GuideDoc }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{guide.title}</Text>
        <Text style={styles.intro}>{guide.intro}</Text>

        <Text style={styles.h2}>What these 8 weeks deliver</Text>
        {guide.outcomes.map((o, i) => (
          <Text key={i} style={styles.item}>- {o}</Text>
        ))}

        <Text style={styles.h2}>Your 8-week plan</Text>
        {guide.weeks.map((w) => (
          <View key={w.week} wrap={false}>
            <Text style={styles.weekTitle}>{w.focus}</Text>
            {w.sessions.map((s, i) => (
              <Text key={i} style={styles.item}>- {s}</Text>
            ))}
            <Text style={styles.item}>{w.note}</Text>
          </View>
        ))}

        <Text style={styles.h2}>The metabolic reset</Text>
        <Text style={styles.item}>{guide.nutritionReset.summary}</Text>
        {[...guide.nutritionReset.eatList, ...guide.nutritionReset.rhythm].map((x, i) => (
          <Text key={i} style={styles.item}>- {x}</Text>
        ))}

        <Text style={styles.h2}>Sleep and stress recovery</Text>
        <Text style={styles.item}>{guide.sleepStress.summary}</Text>
        {guide.sleepStress.practices.map((x, i) => (
          <Text key={i} style={styles.item}>- {x}</Text>
        ))}

        <Text style={styles.h2}>The 10-minute daily routine</Text>
        <Text style={styles.item}>{guide.dailyTenMinute.summary}</Text>
        {guide.dailyTenMinute.movements.map((x, i) => (
          <Text key={i} style={styles.item}>- {x}</Text>
        ))}

        <Text style={styles.h2}>Weekly recalibration</Text>
        <Text style={styles.item}>{guide.recalibration}</Text>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 2: Write the PDF route**

Create `app/guide/[token]/pdf/route.ts`:
```ts
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { redirect } from "next/navigation";
import { getOrderByToken } from "@/lib/guide/orders";
import { GuidePdfDocument } from "@/components/guide/guide-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const order = await getOrderByToken(token);
  if (!order) return new Response("Not found", { status: 404 });
  if (order.status !== "ready" || !order.guide) redirect(`/guide/${token}`);

  const buffer = await renderToBuffer(
    createElement(GuidePdfDocument, { guide: order.guide })
  );
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="second-wind-protocol.pdf"',
    },
  });
}
```

- [ ] **Step 3: Verify types, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: clean build. If the build complains that `@react-pdf/renderer` needs the Node runtime, confirm `export const runtime = "nodejs"` is present (it is).

- [ ] **Step 4: Commit**

```bash
git add components/guide/guide-pdf.tsx app/guide/[token]/pdf/route.ts
git commit -m "feat: downloadable PDF of the generated guide"
```

---

## Task 13: Wire the checkout button, thread answers, add disclosure

**Files:**
- Modify: `components/checkout-button.tsx`
- Modify: `components/guide-pitch.tsx`
- Modify: `app/scan/page.tsx`
- Modify: `app/terms/page.tsx`

- [ ] **Step 1: Rewrite the checkout button**

Replace the entire contents of `components/checkout-button.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSale } from "@/components/sale-context";
import { startGuideGeneration } from "@/lib/guide/start";
import type { Answers } from "@/lib/longevity";

// When `answers` is provided (the result page), clicking starts real guide
// generation and redirects to the tokenized guide URL. Phase C will swap the
// action for a Stripe Checkout redirect that calls the same generation path.
// Without `answers` (the generic /guide page), it keeps the placeholder message.
export function CheckoutButton({ label, answers }: { label?: string; answers?: Answers }) {
  const { price } = useSale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const [placeholder, setPlaceholder] = useState(false);
  const text = label ?? `Get instant access for $${price}`;

  const onClick = () => {
    if (!answers) {
      setPlaceholder(true);
      return;
    }
    setError(false);
    startTransition(async () => {
      try {
        const { token } = await startGuideGeneration(answers);
        router.push(`/guide/${token}`);
      } catch {
        setError(true);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={onClick}
        disabled={pending}
        className="w-full bg-monitor-accent px-8 py-7 text-base font-semibold text-monitor-bg hover:bg-monitor-accent/90 disabled:opacity-70"
      >
        {pending ? "Building your protocol..." : text}
      </Button>
      <p className="font-mono text-xs text-monitor-muted">
        One-time payment. Instant access. Yours to keep.
      </p>
      {placeholder ? (
        <p className="font-mono text-xs text-monitor-alert">
          Run your scan first so we can build your personalized protocol.
        </p>
      ) : null}
      {error ? (
        <p className="font-mono text-xs text-monitor-alert">
          Something went wrong starting your plan. Please try again.
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Thread answers through GuidePitch**

In `components/guide-pitch.tsx`:

Update the import to add the `Answers` type:
```tsx
import type { Answers, Outcome, ScanResult } from "@/lib/longevity";
```
Update the component signature:
```tsx
export function GuidePitch({ result }: { result?: ScanResult }) {
```
to:
```tsx
export function GuidePitch({
  result,
  answers,
}: {
  result?: ScanResult;
  answers?: Answers;
}) {
```
Pass `answers` to the first `CheckoutButton` (the price block):
```tsx
          <CheckoutButton />
```
becomes:
```tsx
          <CheckoutButton answers={answers} />
```
And the closing `CheckoutButton`:
```tsx
          <CheckoutButton
            label={`Start reclaiming your years for $${price}`}
          />
```
becomes:
```tsx
          <CheckoutButton
            label={`Start reclaiming your years for $${price}`}
            answers={answers}
          />
```

- [ ] **Step 3: Pass answers from the scan page**

In `app/scan/page.tsx`, find:
```tsx
          <GuidePitch result={result!} />
```
and replace with:
```tsx
          <GuidePitch result={result!} answers={answers} />
```

- [ ] **Step 4: Add the disclosure to Terms**

In `app/terms/page.tsx`, immediately after the closing `</p>` of the "The product" section (the paragraph ending `their terms also apply at checkout.`), insert:
```tsx
      <h2>Testimonials and imagery</h2>
      <p>
        Reviews, testimonials, and before and after transformation images shown
        anywhere on this site, including while a protocol is being prepared, are{" "}
        <strong>illustrative and AI-generated</strong>. They do not depict real
        customers, real people, or real results, and they are not a guarantee of
        any outcome.
      </p>
```

- [ ] **Step 5: Verify types, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add components/checkout-button.tsx components/guide-pitch.tsx app/scan/page.tsx app/terms/page.tsx
git commit -m "feat: wire buy button to guide generation; AI-content disclosure in terms"
```

---

## Task 14: End-to-end test and final verification

**Files:**
- Modify: `playwright.config.ts`
- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Force the stub generator in the e2e web server**

In `playwright.config.ts`, update the `webServer` block to inject `GUIDE_STUB` and force the in-memory order store (blank Supabase env), so the smoke test is hermetic and never writes to the real database. Next does not override already-set `process.env` values from `.env` files, so passing empty strings here wins over `.env.local`:
```ts
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      ...process.env,
      GUIDE_STUB: "1",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
  },
```

- [ ] **Step 2: Add the purchase -> guide e2e test**

Append to `e2e/smoke.spec.ts`:
```ts
test("buying builds and shows the generated guide", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /begin/i }).click();

  await page.getByLabel("Age").fill("35");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  for (let i = 0; i < 25; i++) {
    await page
      .getByRole("radiogroup")
      .first()
      .getByRole("radio")
      .first()
      .click();
    const runScan = page.getByRole("button", { name: /run scan/i });
    if (await runScan.count()) {
      await runScan.click();
      break;
    }
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }

  await expect(
    page.getByRole("heading", { name: /your estimated lifespan/i })
  ).toBeVisible({ timeout: 15000 });

  // Start checkout (the first buy CTA).
  await page.getByRole("button", { name: /get instant access/i }).first().click();

  // Lands on the building screen, then the generated guide appears.
  await expect(
    page.getByRole("heading", { name: /being written/i })
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: /your 8-week plan/i })
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByRole("link", { name: /download your pdf/i })
  ).toBeVisible();
});
```

- [ ] **Step 3: Run the full unit suite + typecheck + lint + build**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all PASS, clean build.

- [ ] **Step 4: Run the e2e suite**

Run: `npm run e2e`
Expected: both tests PASS (the original flow + the new purchase -> guide flow). If a stale dev server without `GUIDE_STUB` is being reused, stop it first so Playwright starts a fresh one with the env (the stub also triggers automatically whenever `ANTHROPIC_API_KEY` is unset).

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/smoke.spec.ts
git commit -m "test: e2e for purchase to generated guide via stub"
```

- [ ] **Step 6: Finish the branch**

Invoke the `superpowers:finishing-a-development-branch` skill to decide how to integrate `feat/phase-b-guide` (merge, PR, or keep iterating). Before merging, confirm the verification loop is green and note the operator follow-ups below.

---

## Operator follow-ups (outside the code)

These are required for the live (non-stub) path but are not code tasks:
1. Create a Supabase project; run `supabase/migrations/20260603120000_orders.sql`.
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ANTHROPIC_API_KEY` in `.env.local` (and in the deployment environment).
3. Drop real before/after image assets into `/public` and render them in place of the placeholder slots in `components/guide/guide-building-screen.tsx`.
4. Phase C: replace the buy button's direct `startGuideGeneration` call with a Stripe Checkout redirect, and call `startGuideGeneration` (or `generateGuide`) from the verified `checkout.session.completed` webhook instead.

---

## Self-Review

**Spec coverage:**
- Decoupled trigger + Stripe seam -> Tasks 9, 13 (`startGuideGeneration`), noted in operator follow-up 4. Covered.
- Supabase persistence (orders table) -> Tasks 5, 6. Covered.
- Async + pending state via `after()` -> Tasks 9, 10. Covered.
- Waiting page as conversion surface (testimonials + before/after) -> Task 11. Covered.
- Fixed shared testimonials/photos; placeholder images -> Task 11 (`testimonials.ts`, placeholder slots). Covered.
- In-app render + PDF -> Tasks 11, 12. Covered.
- Tokenized URL access -> Task 10. Covered.
- Claude integration (sonnet-4-6, cached system prompt, tool output, no stream, stub path) -> Tasks 7, 8. Covered.
- Disclosure in /terms only -> Task 13. Covered.
- Error handling (invalid answers, failure, stale retry, 404, pre-ready PDF redirect) -> Tasks 8, 9 (validation), 10 (retry/404), 12 (redirect). Covered.
- Testing (prompt, schema, generate mocked, e2e with stub) -> Tasks 2, 3, 4, 6, 8, 14. Covered.
- UI via design-taste-frontend-v1, dark-monitor theme, no em-dashes -> noted in Task 11 and the header. Covered.

**Placeholder scan:** No "TBD/TODO/handle edge cases" left. The temporary inline renders in Task 10 are explicitly replaced in Task 11 (intentional, sequenced). Migration filename uses a concrete timestamp.

**Type consistency:** `OrderRow` (with `created_at`) defined in Task 6 is used consistently in Tasks 8, 10, 12. `GuideDoc`/`GuideWeek` from Task 2 used in Tasks 3, 7, 8, 11, 12. `startGuideGeneration` signature `(answers) => { token }` consistent across Tasks 9, 13. `requestGuide(system, user)` consistent across Tasks 7, 8. `generateGuide(token)` consistent across Tasks 8, 9, 10. `buildFixtureGuide(result)` consistent across Tasks 3, 6, 8. No naming drift found.
