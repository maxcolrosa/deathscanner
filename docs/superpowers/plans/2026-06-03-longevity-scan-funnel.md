# The Longevity Scan™ Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a parody "AI longevity assessment" web app that runs a mock-clinical lifestyle quiz, fakes an analysis, reveals a predicted death date, and funnels the user into a low-ticket fitness guide (placeholder checkout).

**Architecture:** Next.js App Router app. A pure, deterministic, unit-tested engine (`lib/longevity.ts`) is the single source of truth for the prediction (no AI API, no network). The `/scan` route is a client-side state machine (quiz → analyzing → report → pitch). All other surfaces are static. The visual system is a dark "diagnostic monitor" theme.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind v4, shadcn/ui, Motion (`motion/react`), Geist + Geist Mono fonts, Vitest for engine tests, Playwright for an optional smoke test.

**Design contract (from `design-taste-frontend`):** ONE locked dark theme; one brand accent (clinical teal `#2ee6c9`) plus a semantic alert state (red `#ff453a`) reserved for death/risk data; mono on every number; motion honors `prefers-reduced-motion`; **zero em-dashes (`—`) in any user-facing string**; no scroll cues; no decorative status dots; hero headline ≤ 2 lines with CTA above the fold.

**Spec:** `docs/superpowers/specs/2026-06-03-longevity-scan-funnel-design.md`

---

## File Structure

```
app/
  layout.tsx              # fonts, dark theme lock, metadata, global footer
  globals.css             # Tailwind v4 import + dark-monitor theme tokens
  page.tsx                # landing hero (server component)
  scan/page.tsx           # client state machine: quiz -> analyzing -> report -> pitch
  guide/page.tsx          # standalone guide pitch
components/
  monitor-visual.tsx      # animated ECG + index gauge (hero visual)
  quiz-step.tsx           # renders ONE question (age input or choice radios)
  analyzing-sequence.tsx  # fake medical analysis animation
  count-up.tsx            # animated number count-up (reduced-motion safe)
  report-card.tsx         # death-date reveal + risk breakdown + recoverable callout
  guide-pitch.tsx         # sales section
  checkout-button.tsx     # isolated placeholder buy button
  disclaimer.tsx          # parody disclaimer line
  site-footer.tsx         # global footer with disclaimer
  ui/                     # shadcn primitives (button, radio-group)
lib/
  longevity.ts            # deterministic engine: types, QUESTIONS, computeResult
  longevity.test.ts       # Vitest unit tests for the engine
  product.ts              # single editable product (name/price) for the funnel
e2e/
  smoke.spec.ts           # optional Playwright smoke test of the full flow
vitest.config.ts
```

---

## Task 1: Scaffold the Next.js project

The project root already contains `docs/`, `.git/`, `.claude/`, `.gitignore`. `create-next-app` refuses to run in a non-empty directory, so we scaffold into a temp dir and merge its contents up.

**Files:**
- Create: entire Next.js app skeleton (`package.json`, `app/`, `tsconfig.json`, etc.)

- [ ] **Step 1: Scaffold into a temp directory**

Run:
```bash
npx create-next-app@latest .cna-tmp \
  --typescript --tailwind --app --eslint \
  --no-src-dir --import-alias "@/*" --use-npm --yes
```
Expected: completes with "Success! Created .cna-tmp".

- [ ] **Step 2: Merge the scaffold into the project root, then remove the temp dir**

Run:
```bash
shopt -s dotglob
cp -R .cna-tmp/. .
rm -rf .cna-tmp
shopt -u dotglob
```
Expected: `package.json`, `app/`, `next.config.ts`, `tsconfig.json` now exist in the project root. `docs/` and `.git/` are untouched.

- [ ] **Step 3: Install runtime dependencies (Motion + Geist)**

Run:
```bash
npm install motion geist
```
Expected: both added to `package.json` dependencies.

- [ ] **Step 4: Verify the project builds**

Run:
```bash
npm run build
```
Expected: "Compiled successfully" with no type errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind, Motion, Geist"
```

---

## Task 2: Set up Vitest for engine tests

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Install Vitest and the tsconfig-paths resolver**

Run:
```bash
npm install -D vitest vite-tsconfig-paths
```
Expected: both added to devDependencies.

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add test scripts to `package.json`**

In `package.json`, add to the `"scripts"` object:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Add a temporary smoke test to prove the runner works**

Create `lib/longevity.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("test runner", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json package-lock.json lib/longevity.test.ts
git commit -m "test: configure Vitest for engine unit tests"
```

---

## Task 3: Build the longevity engine (TDD)

The engine is pure and deterministic. `computeResult` takes answers (and an injectable `today` for testing) and returns a `ScanResult`.

**Files:**
- Modify: `lib/longevity.test.ts` (replace smoke test with real tests)
- Create: `lib/longevity.ts`

- [ ] **Step 1: Replace the smoke test with the real failing tests**

Replace the entire contents of `lib/longevity.test.ts`:
```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL with a module-resolution / "computeResult is not exported" error (the file does not exist yet).

- [ ] **Step 3: Implement the engine**

Create `lib/longevity.ts`:
```ts
// Deterministic, offline "AI" engine for The Longevity Scan parody.
// No network, no randomness. Same inputs + same `today` => same output.

export type QuestionKind = "age" | "choice";

export interface QuizOption {
  value: string;
  label: string;
  /** Years added (positive) or subtracted (negative) from base life expectancy. */
  yearsDelta: number;
}

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  helper?: string;
  /** Whether losses from this factor are framed as recoverable via the guide. */
  recoverable: boolean;
  /** Present when kind === "choice". */
  options?: QuizOption[];
  /** Present when kind === "age". */
  min?: number;
  max?: number;
}

export type Answers = Record<string, string | number>;

export interface RiskFactor {
  id: string;
  label: string;
  deltaYears: number;
  recoverable: boolean;
}

export interface ScanResult {
  currentAge: number;
  lifeExpectancy: number;
  ageAtDeath: number;
  predictedDeathDate: Date;
  totalDelta: number;
  factors: RiskFactor[];
  recoverableYears: number;
}

export const BASE_LIFE_EXPECTANCY = 79;
export const MIN_AGE = 13;
export const MAX_AGE = 100;
export const MAX_LIFE_EXPECTANCY = 105;

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "age",
    kind: "age",
    prompt: "What is your current age?",
    helper: "We need a baseline. Be honest. The machine knows.",
    recoverable: false,
    min: MIN_AGE,
    max: MAX_AGE,
  },
  {
    id: "activity",
    kind: "choice",
    prompt: "How physically active are you?",
    recoverable: true,
    options: [
      { value: "sedentary", label: "I avoid stairs on principle", yearsDelta: -4 },
      { value: "light", label: "The occasional walk to the fridge", yearsDelta: -1 },
      { value: "moderate", label: "I move on purpose a few times a week", yearsDelta: 2 },
      { value: "high", label: "The gym is my entire personality", yearsDelta: 4 },
    ],
  },
  {
    id: "diet",
    kind: "choice",
    prompt: "How would you describe your diet?",
    recoverable: true,
    options: [
      { value: "ultraprocessed", label: "Beige, fried, and delivered", yearsDelta: -5 },
      { value: "mixed", label: "A bit of everything, mostly chaos", yearsDelta: -1 },
      { value: "balanced", label: "Real food, most of the time", yearsDelta: 2 },
      { value: "clean", label: "I have opinions about olive oil", yearsDelta: 4 },
    ],
  },
  {
    id: "sleep",
    kind: "choice",
    prompt: "How much do you sleep per night?",
    recoverable: true,
    options: [
      { value: "under5", label: "Under 5 hours, who needs it", yearsDelta: -4 },
      { value: "5to6", label: "5 to 6 hours", yearsDelta: -2 },
      { value: "7to8", label: "7 to 8 glorious hours", yearsDelta: 3 },
      { value: "over9", label: "9 plus hours (suspicious)", yearsDelta: 0 },
    ],
  },
  {
    id: "smoking",
    kind: "choice",
    prompt: "Do you smoke or vape?",
    recoverable: true,
    options: [
      { value: "heavy", label: "Like a chimney", yearsDelta: -9 },
      { value: "social", label: "Only when stressed (always)", yearsDelta: -3 },
      { value: "vape", label: "Just the vape, it is basically water", yearsDelta: -2 },
      { value: "never", label: "Never touched it", yearsDelta: 1 },
    ],
  },
  {
    id: "alcohol",
    kind: "choice",
    prompt: "How much do you drink?",
    recoverable: true,
    options: [
      { value: "heavy", label: "Brunch is a personality", yearsDelta: -6 },
      { value: "regular", label: "A few most nights", yearsDelta: -2 },
      { value: "occasional", label: "Socially, sometimes", yearsDelta: 0 },
      { value: "never", label: "I do not drink", yearsDelta: 1 },
    ],
  },
  {
    id: "stress",
    kind: "choice",
    prompt: "What is your stress level?",
    recoverable: true,
    options: [
      { value: "constant", label: "My jaw is clenched right now", yearsDelta: -4 },
      { value: "frequent", label: "Frequently frazzled", yearsDelta: -2 },
      { value: "managed", label: "Mostly under control", yearsDelta: 1 },
      { value: "zen", label: "Disturbingly calm", yearsDelta: 3 },
    ],
  },
  {
    id: "genetics",
    kind: "choice",
    prompt: "How long do people in your family tend to live?",
    helper: "Genetics. The one thing the protocol cannot fix.",
    recoverable: false,
    options: [
      { value: "short", label: "Everyone retired early, permanently", yearsDelta: -5 },
      { value: "average", label: "A normal, forgettable lifespan", yearsDelta: 0 },
      { value: "long", label: "Great-grandma is still winning arguments at 99", yearsDelta: 5 },
    ],
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date.getTime());
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function toNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Compute the parody longevity result from quiz answers.
 * @param answers map of questionId -> selected value
 * @param today injectable current date (defaults to now) for deterministic tests
 */
export function computeResult(answers: Answers, today: Date = new Date()): ScanResult {
  const ageQuestion = QUESTIONS.find((q) => q.kind === "age")!;
  const currentAge = clamp(
    Math.round(toNumber(answers[ageQuestion.id])),
    ageQuestion.min ?? MIN_AGE,
    ageQuestion.max ?? MAX_AGE
  );

  const factors: RiskFactor[] = [];
  let totalDelta = 0;

  for (const q of QUESTIONS) {
    if (q.kind !== "choice") continue;
    const selectedValue = answers[q.id];
    const option = q.options!.find((o) => o.value === selectedValue) ?? q.options![0];
    totalDelta += option.yearsDelta;
    factors.push({
      id: q.id,
      label: option.label,
      deltaYears: option.yearsDelta,
      recoverable: q.recoverable,
    });
  }

  const lifeExpectancy = clamp(
    Math.round(BASE_LIFE_EXPECTANCY + totalDelta),
    currentAge + 1,
    MAX_LIFE_EXPECTANCY
  );

  const predictedDeathDate = addYears(today, lifeExpectancy - currentAge);

  const recoverableYears = factors
    .filter((f) => f.recoverable && f.deltaYears < 0)
    .reduce((sum, f) => sum - f.deltaYears, 0);

  return {
    currentAge,
    lifeExpectancy,
    ageAtDeath: lifeExpectancy,
    predictedDeathDate,
    totalDelta,
    factors,
    recoverableYears,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/longevity.ts lib/longevity.test.ts
git commit -m "feat: deterministic longevity engine with TDD coverage"
```

---

## Task 4: Initialize shadcn/ui and add primitives

**Files:**
- Create: `components/ui/button.tsx`, `components/ui/radio-group.tsx`, `lib/utils.ts`, `components.json`

- [ ] **Step 1: Initialize shadcn with defaults**

Run:
```bash
npx shadcn@latest init -d
```
Expected: creates `components.json`, `lib/utils.ts`, and writes CSS variables into `app/globals.css`. (We overwrite `globals.css` in Task 5, so its edits here do not matter.)

- [ ] **Step 2: Add the Button and RadioGroup components**

Run:
```bash
npx shadcn@latest add button radio-group --yes
```
Expected: creates `components/ui/button.tsx` and `components/ui/radio-group.tsx`.

- [ ] **Step 3: Verify the project still type-checks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add shadcn/ui button and radio-group"
```

---

## Task 5: Dark "diagnostic monitor" theme + root layout

**Files:**
- Create/Overwrite: `app/globals.css`
- Overwrite: `app/layout.tsx`

- [ ] **Step 1: Write the theme tokens**

Overwrite `app/globals.css`:
```css
@import "tailwindcss";

@theme {
  /* Brand palette */
  --color-monitor-bg: #070b0d;
  --color-monitor-panel: #0c1418;
  --color-monitor-line: #16242b;
  --color-monitor-fg: #d7e3e6;
  --color-monitor-muted: #6b8088;
  --color-monitor-accent: #2ee6c9;
  --color-monitor-alert: #ff453a;

  /* shadcn/ui semantic tokens mapped to the monitor palette, so the Button
     and RadioGroup primitives render correctly after we overwrite the file
     that `shadcn init` generated. */
  --color-background: #070b0d;
  --color-foreground: #d7e3e6;
  --color-primary: #2ee6c9;
  --color-primary-foreground: #070b0d;
  --color-secondary: #0c1418;
  --color-secondary-foreground: #d7e3e6;
  --color-muted: #0c1418;
  --color-muted-foreground: #6b8088;
  --color-accent: #0c1418;
  --color-accent-foreground: #d7e3e6;
  --color-destructive: #ff453a;
  --color-destructive-foreground: #070b0d;
  --color-border: #16242b;
  --color-input: #16242b;
  --color-ring: #2ee6c9;
  --radius: 0.5rem;

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  color-scheme: dark;
}

html,
body {
  background-color: var(--color-monitor-bg);
  color: var(--color-monitor-fg);
}

/* Subtle scanline texture for the monitor feel. Fixed + non-interactive so it
   never repaints on scroll. */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    0deg,
    rgba(46, 230, 201, 0.03) 0px,
    rgba(46, 230, 201, 0.03) 1px,
    transparent 1px,
    transparent 3px
  );
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 2: Write the root layout with fonts, theme lock, and footer**

Overwrite `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Longevity Scan",
  description:
    "A clinical-grade longevity assessment. (It is a parody. It predicts nothing.)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh] antialiased font-sans">
        <div className="flex min-h-[100dvh] flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the dev server renders the dark theme**

Run: `npm run dev` and open `http://localhost:3000`.
Expected: the default Next.js page renders on a near-black background. (The layout imports `SiteFooter`, created next; if the server errors on the missing import, proceed to Task 6 then re-check.)

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: dark diagnostic-monitor theme and root layout"
```

---

## Task 6: Disclaimer and SiteFooter components

**Files:**
- Create: `components/disclaimer.tsx`
- Create: `components/site-footer.tsx`

- [ ] **Step 1: Create the Disclaimer component**

Create `components/disclaimer.tsx`:
```tsx
export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`font-mono text-xs leading-relaxed text-monitor-muted ${className}`}>
      This is a parody. The Longevity Scan is not a medical device, not medical
      advice, and predicts nothing. For entertainment only.
    </p>
  );
}
```

- [ ] **Step 2: Create the SiteFooter component**

Create `components/site-footer.tsx`:
```tsx
import { Disclaimer } from "@/components/disclaimer";

export function SiteFooter() {
  return (
    <footer className="border-t border-monitor-line px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <span className="font-mono text-sm tracking-tight text-monitor-fg">
          LONGEVITY SCAN
        </span>
        <Disclaimer className="max-w-[65ch]" />
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/disclaimer.tsx components/site-footer.tsx
git commit -m "feat: parody disclaimer and global footer"
```

---

## Task 7: Monitor visual (animated ECG + index gauge)

A real, animated SVG product visual for the hero (not a fake screenshot).

**Files:**
- Create: `components/monitor-visual.tsx`

- [ ] **Step 1: Create the MonitorVisual component**

Create `components/monitor-visual.tsx`:
```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

// A looping ECG trace plus a static "index" readout. The motion communicates
// "live instrument"; it collapses to a static trace under reduced motion.
export function MonitorVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="rounded-lg border border-monitor-line bg-monitor-panel p-6">
      <div className="flex items-center justify-between font-mono text-xs text-monitor-muted">
        <span>LIVE TRACE</span>
        <span className="text-monitor-accent">vitals nominal</span>
      </div>

      <svg
        viewBox="0 0 320 90"
        className="mt-4 w-full"
        role="img"
        aria-label="A stylized heart-rate trace"
      >
        <motion.path
          d="M0 45 H70 L80 45 L88 20 L96 70 L104 45 H150 L160 45 L168 30 L176 60 L184 45 H320"
          fill="none"
          stroke="var(--color-monitor-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0.4 }}
          animate={reduce ? undefined : { pathLength: 1, opacity: 1 }}
          transition={
            reduce
              ? undefined
              : { duration: 2.2, repeat: Infinity, ease: "linear" }
          }
        />
      </svg>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="font-mono text-5xl tracking-tighter text-monitor-fg">
            82.4
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            longevity index
          </div>
        </div>
        <div className="font-mono text-xs text-monitor-muted">
          calibrating...
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/monitor-visual.tsx
git commit -m "feat: animated ECG monitor visual for hero"
```

---

## Task 8: Landing page (hero)

**Files:**
- Overwrite: `app/page.tsx`

- [ ] **Step 1: Write the landing hero**

Overwrite `app/page.tsx`:
```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MonitorVisual } from "@/components/monitor-visual";
import { Disclaimer } from "@/components/disclaimer";

export default function Home() {
  return (
    <main className="px-6">
      <section className="mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-12 py-20 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            Longevity Scan
          </span>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tighter text-monitor-fg md:text-6xl">
            Find out when
            <br />
            you will die.
          </h1>
          <p className="max-w-[48ch] text-base leading-relaxed text-monitor-muted">
            A clinical-grade longevity assessment. Answer eight questions and our
            instrument will estimate your expiry date with unearned confidence.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              asChild
              className="bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
            >
              <Link href="/scan">Begin Assessment</Link>
            </Button>
            <span className="font-mono text-xs text-monitor-muted">
              Takes about 60 seconds
            </span>
          </div>
          <Disclaimer className="mt-2 max-w-[55ch]" />
        </div>

        <MonitorVisual />
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev` and open `http://localhost:3000`.
Expected: dark hero, teal accent eyebrow, animated ECG visual on the right (left-stacked on mobile), "Begin Assessment" button links to `/scan`.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: landing hero page"
```

---

## Task 9: QuizStep component

Renders exactly one question. Age questions use a number input; choice questions use a radio group. Reports validity to the parent.

**Files:**
- Create: `components/quiz-step.tsx`

- [ ] **Step 1: Create the QuizStep component**

Create `components/quiz-step.tsx`:
```tsx
"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { Answers, QuizQuestion } from "@/lib/longevity";

interface QuizStepProps {
  question: QuizQuestion;
  index: number;
  total: number;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuizStep({
  question,
  index,
  total,
  value,
  onChange,
  onNext,
  onBack,
}: QuizStepProps) {
  const progress = Math.round((index / total) * 100);

  const ageValid =
    question.kind === "age" &&
    typeof value === "number" &&
    value >= (question.min ?? 0) &&
    value <= (question.max ?? 200);
  const choiceValid = question.kind === "choice" && typeof value === "string";
  const canAdvance = ageValid || choiceValid;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-xs text-monitor-muted">
          <span>
            QUESTION {String(index + 1).padStart(2, "0")} / {total}
          </span>
          <span className="text-monitor-accent">SCANNING</span>
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-monitor-line"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-monitor-accent transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          {question.prompt}
        </h2>
        {question.helper ? (
          <p className="font-mono text-sm text-monitor-muted">{question.helper}</p>
        ) : null}
      </div>

      {question.kind === "age" ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="age-input"
            className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted"
          >
            Age
          </label>
          <input
            id="age-input"
            type="number"
            inputMode="numeric"
            min={question.min}
            max={question.max}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-40 rounded-md border border-monitor-line bg-monitor-panel px-4 py-3 font-mono text-2xl text-monitor-fg outline-none focus:border-monitor-accent"
          />
          {typeof value === "number" && !ageValid ? (
            <p className="font-mono text-xs text-monitor-alert">
              Enter an age between {question.min} and {question.max}.
            </p>
          ) : null}
        </div>
      ) : (
        <RadioGroup
          value={typeof value === "string" ? value : ""}
          onValueChange={(v) => onChange(v)}
          className="flex flex-col gap-3"
        >
          {question.options!.map((option) => (
            <label
              key={option.value}
              htmlFor={`${question.id}-${option.value}`}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-monitor-line bg-monitor-panel px-4 py-4 text-monitor-fg transition-colors hover:border-monitor-accent/60 has-[:checked]:border-monitor-accent"
            >
              <RadioGroupItem
                id={`${question.id}-${option.value}`}
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={index === 0}
          className="text-monitor-muted hover:text-monitor-fg"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canAdvance}
          className="bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
        >
          {index === total - 1 ? "Run Scan" : "Next"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/quiz-step.tsx
git commit -m "feat: quiz step component"
```

---

## Task 10: AnalyzingSequence component

**Files:**
- Create: `components/analyzing-sequence.tsx`

- [ ] **Step 1: Create the AnalyzingSequence component**

Create `components/analyzing-sequence.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

const LOG_LINES = [
  "Initializing biometric intake...",
  "Cross-referencing actuarial tables...",
  "Analyzing metabolic markers...",
  "Estimating cellular wear...",
  "Compiling mortality projection...",
];

const LINE_INTERVAL_MS = 600;
const TAIL_MS = 800;

export function AnalyzingSequence({ onComplete }: { onComplete: () => void }) {
  const reduce = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduce) {
      onComplete();
      return;
    }

    const timers = LOG_LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), LINE_INTERVAL_MS * (i + 1))
    );

    const durationS = (LINE_INTERVAL_MS * LOG_LINES.length + TAIL_MS) / 1000;
    const controls = animate(0, 100, {
      duration: durationS,
      ease: "linear",
      onUpdate: (v) => setProgress(v),
      onComplete: () => onComplete(),
    });

    return () => {
      timers.forEach(clearTimeout);
      controls.stop();
    };
  }, [reduce, onComplete]);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
          Analyzing
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          Running your longevity scan
        </h2>
      </div>

      <div className="rounded-lg border border-monitor-line bg-monitor-panel p-6 font-mono text-sm">
        <ul className="flex flex-col gap-2">
          {LOG_LINES.slice(0, visibleLines).map((line) => (
            <li key={line} className="text-monitor-fg">
              <span className="text-monitor-accent">{">"} </span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-1 w-full overflow-hidden rounded-full bg-monitor-line">
          <div
            className="h-full bg-monitor-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-xs text-monitor-muted">
          {Math.round(progress)}% complete
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/analyzing-sequence.tsx
git commit -m "feat: fake analyzing sequence animation"
```

---

## Task 11: CountUp + ReportCard

**Files:**
- Create: `components/count-up.tsx`
- Create: `components/report-card.tsx`

- [ ] **Step 1: Create the CountUp component**

Create `components/count-up.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

export function CountUp({
  to,
  duration = 1.6,
  className = "",
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, duration, reduce]);

  return <span className={className}>{value}</span>;
}
```

- [ ] **Step 2: Create the ReportCard component**

Create `components/report-card.tsx`:
```tsx
"use client";

import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import type { ScanResult } from "@/lib/longevity";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function ReportCard({
  result,
  onSeePlan,
}: {
  result: ScanResult;
  onSeePlan: () => void;
}) {
  const deathLabel = dateFormatter.format(result.predictedDeathDate);

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-20">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-alert">
          Scan complete
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          Your projected expiry
        </h2>
      </div>

      <div className="rounded-lg border border-monitor-alert/40 bg-monitor-panel p-8">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          Estimated date of death
        </div>
        <div className="mt-2 font-mono text-5xl tracking-tighter text-monitor-alert md:text-6xl">
          {deathLabel}
        </div>
        <div className="mt-4 font-mono text-sm text-monitor-fg">
          Age at death:{" "}
          <CountUp to={result.ageAtDeath} className="text-monitor-alert" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          Risk factor breakdown
        </h3>
        <ul className="flex flex-col divide-y divide-monitor-line">
          {result.factors.map((factor) => {
            const positive = factor.deltaYears >= 0;
            return (
              <li
                key={factor.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="text-sm text-monitor-fg">{factor.label}</span>
                <span
                  className={`font-mono text-sm ${
                    positive ? "text-monitor-accent" : "text-monitor-alert"
                  }`}
                >
                  {positive ? "+" : ""}
                  {factor.deltaYears} yr
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {result.recoverableYears > 0 ? (
        <div className="rounded-lg border border-monitor-accent/40 bg-monitor-panel p-6">
          <p className="text-lg text-monitor-fg">
            Good news. About{" "}
            <span className="font-mono text-monitor-accent">
              {result.recoverableYears} years
            </span>{" "}
            of those losses are recoverable. Your habits did this. Your habits can
            undo it.
          </p>
          <Button
            onClick={onSeePlan}
            className="mt-4 bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
          >
            See how to reclaim them
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-monitor-accent/40 bg-monitor-panel p-6">
          <p className="text-lg text-monitor-fg">
            Annoyingly, your habits are already excellent. You can still buy the
            guide to feel superior about it.
          </p>
          <Button
            onClick={onSeePlan}
            className="mt-4 bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
          >
            See the protocol
          </Button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/count-up.tsx components/report-card.tsx
git commit -m "feat: count-up and report card with risk breakdown"
```

---

## Task 12: Product config, CheckoutButton, and GuidePitch

**Files:**
- Create: `lib/product.ts`
- Create: `components/checkout-button.tsx`
- Create: `components/guide-pitch.tsx`

- [ ] **Step 1: Create the single editable product config**

Create `lib/product.ts`:
```ts
// The single place to edit the funnel product. Swap these values, or wire the
// CheckoutButton to Stripe later, without touching the UI.
export const PRODUCT = {
  name: "The Second Wind Protocol",
  tagline: "An 8-week fat-loss and fitness reset.",
  priceUsd: 14,
} as const;
```

- [ ] **Step 2: Create the isolated CheckoutButton (placeholder)**

Create `components/checkout-button.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PRODUCT } from "@/lib/product";

// Placeholder checkout. To go live, replace handleClick with a Stripe Checkout
// Session redirect or a Payment Link. This is the only file that must change.
export function CheckoutButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => setClicked(true)}
        className="bg-monitor-accent px-8 py-6 text-base text-monitor-bg hover:bg-monitor-accent/90"
      >
        Get the protocol for ${PRODUCT.priceUsd}
      </Button>
      {clicked ? (
        <p className="font-mono text-xs text-monitor-muted">
          Checkout is not wired up yet. This is where Stripe would take your money.
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Create the GuidePitch component**

Create `components/guide-pitch.tsx`:
```tsx
import { CheckoutButton } from "@/components/checkout-button";
import { Disclaimer } from "@/components/disclaimer";
import { PRODUCT } from "@/lib/product";

const BENEFITS = [
  {
    stat: "8 wk",
    body: "A structured reset for fat loss and energy, no equipment required.",
  },
  {
    stat: "20 min",
    body: "Daily sessions short enough that even your worst self will comply.",
  },
  {
    stat: "0 fads",
    body: "No detox teas, no fasting cults. Boring methods that actually work.",
  },
];

export function GuidePitch({ recoverableYears }: { recoverableYears: number }) {
  const headline =
    recoverableYears > 0
      ? `Reclaim your ${recoverableYears} years`
      : "Stay ahead of the curve";

  return (
    <section className="border-t border-monitor-line px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            {PRODUCT.name}
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-monitor-fg">
            {headline}
          </h2>
          <p className="max-w-[55ch] text-base leading-relaxed text-monitor-muted">
            {PRODUCT.tagline} The scan found the damage. This is the part where you
            do something about it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.stat}
              className="rounded-lg border border-monitor-line bg-monitor-panel p-5"
            >
              <div className="font-mono text-2xl tracking-tighter text-monitor-accent">
                {b.stat}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-monitor-muted">
                {b.body}
              </p>
            </div>
          ))}
        </div>

        <CheckoutButton />
        <Disclaimer className="max-w-[60ch]" />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/product.ts components/checkout-button.tsx components/guide-pitch.tsx
git commit -m "feat: guide pitch with placeholder checkout"
```

---

## Task 13: The /scan state machine

Wires quiz → analyzing → report → pitch. Holds all answers in client state.

**Files:**
- Create: `app/scan/page.tsx`

- [ ] **Step 1: Create the scan page**

Create `app/scan/page.tsx`:
```tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { QuizStep } from "@/components/quiz-step";
import { AnalyzingSequence } from "@/components/analyzing-sequence";
import { ReportCard } from "@/components/report-card";
import { GuidePitch } from "@/components/guide-pitch";
import { QUESTIONS, computeResult, type Answers } from "@/lib/longevity";

type Phase = "quiz" | "analyzing" | "result";

export default function ScanPage() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const pitchRef = useRef<HTMLDivElement>(null);

  const question = QUESTIONS[stepIndex];

  const handleChange = useCallback(
    (value: string | number) => {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    },
    [question.id]
  );

  const handleNext = useCallback(() => {
    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setPhase("analyzing");
    }
  }, [stepIndex]);

  const handleBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    setPhase("result");
  }, []);

  const result = useMemo(
    () => (phase === "result" ? computeResult(answers) : null),
    [phase, answers]
  );

  const scrollToPitch = useCallback(() => {
    pitchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (phase === "quiz") {
    return (
      <QuizStep
        question={question}
        index={stepIndex}
        total={QUESTIONS.length}
        value={answers[question.id]}
        onChange={handleChange}
        onNext={handleNext}
        onBack={handleBack}
      />
    );
  }

  if (phase === "analyzing") {
    return <AnalyzingSequence onComplete={handleAnalysisComplete} />;
  }

  return (
    <main>
      <ReportCard result={result!} onSeePlan={scrollToPitch} />
      <div ref={pitchRef}>
        <GuidePitch recoverableYears={result!.recoverableYears} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Manually test the full flow**

Run: `npm run dev`, open `http://localhost:3000/scan`.
Expected: enter age, answer each question (Next disabled until answered), "Run Scan" triggers the analyzing animation, then the report shows a death date + risk breakdown, and the CTA smooth-scrolls to the guide pitch.

- [ ] **Step 3: Commit**

```bash
git add app/scan/page.tsx
git commit -m "feat: scan state machine wiring quiz to report to pitch"
```

---

## Task 14: Standalone /guide page

**Files:**
- Create: `app/guide/page.tsx`

- [ ] **Step 1: Create the guide page**

Create `app/guide/page.tsx`:
```tsx
import { GuidePitch } from "@/components/guide-pitch";

export default function GuidePage() {
  return (
    <main className="px-6 pt-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-monitor-fg">
          The protocol
        </h1>
        <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-monitor-muted">
          You do not need a death scan to start. You just need to start.
        </p>
      </div>
      <GuidePitch recoverableYears={0} />
    </main>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev`, open `http://localhost:3000/guide`.
Expected: heading, intro copy, and the guide pitch with the placeholder buy button.

- [ ] **Step 3: Commit**

```bash
git add app/guide/page.tsx
git commit -m "feat: standalone guide page"
```

---

## Task 15: Optional Playwright smoke test + final verification

**Files:**
- Create: `e2e/smoke.spec.ts`
- Create: `playwright.config.ts`
- Modify: `package.json` (e2e script)

- [ ] **Step 1: Install Playwright**

Run:
```bash
npm install -D @playwright/test
npx playwright install chromium
```
Expected: Chromium downloaded.

- [ ] **Step 2: Create the Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
```

- [ ] **Step 3: Add the e2e script to `package.json`**

In `"scripts"`, add:
```json
"e2e": "playwright test"
```

- [ ] **Step 4: Write the smoke test**

Create `e2e/smoke.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("full scan flow reaches the report and pitch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /find out when/i })
  ).toBeVisible();

  await page.getByRole("link", { name: /begin assessment/i }).click();

  // Age question
  await page.getByLabel("Age").fill("35");
  await page.getByRole("button", { name: /next/i }).click();

  // Answer the remaining choice questions by picking the first option each.
  for (let i = 0; i < 7; i++) {
    await page.getByRole("radio").first().click();
    const label = i === 6 ? /run scan/i : /next/i;
    await page.getByRole("button", { name: label }).click();
  }

  // Report appears (waits out the analyzing animation).
  await expect(
    page.getByRole("heading", { name: /your projected expiry/i })
  ).toBeVisible({ timeout: 15000 });

  await expect(page.getByText(/estimated date of death/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /get the protocol/i })).toBeVisible();
});
```

- [ ] **Step 5: Run the smoke test**

Run: `npm run e2e`
Expected: 1 passed.

- [ ] **Step 6: Run full verification (engine tests, lint, type-check, build)**

Run:
```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```
Expected: Vitest passes, no type errors, lint clean, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add e2e playwright.config.ts package.json package-lock.json
git commit -m "test: end-to-end smoke test of the scan funnel"
```

---

## Self-Review Notes

- **Spec coverage:** engine (Task 3) ✓; quiz with age anchor (Tasks 9, 13) ✓; fake analysis (Task 10) ✓; death-date report + risk breakdown + recoverable callout (Task 11) ✓; guide pitch + placeholder checkout, low-ticket price (Task 12) ✓; dark diagnostic-monitor theme + Geist/mono (Task 5) ✓; disclaimers on every page via footer + hero + pitch (Tasks 5, 6, 8, 12) ✓; landing (Task 8) and /guide (Task 14) ✓; TDD on the engine (Task 3) ✓; optional Playwright smoke (Task 15) ✓.
- **Design guardrails:** all user-facing copy avoids em-dashes; one accent (teal) with a semantic alert (red) only on death/risk data; mono on all numbers; reduced-motion handled in `globals.css` plus per-component `useReducedMotion`; hero is a single-screen asymmetric split with the CTA above the fold.
- **Type consistency:** `Answers`, `QuizQuestion`, `ScanResult`, `computeResult`, `QUESTIONS`, `RiskFactor`, and `PRODUCT` are used with identical shapes across the engine, components, and pages.
- **Known follow-ups (out of scope, per spec):** real Stripe checkout behind `CheckoutButton`; email capture; shareable result URLs; real guide content.
```
