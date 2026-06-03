# The Longevity Scan™ — Design Spec

**Date:** 2026-06-03
**Status:** Approved
**Type:** Parody web app + sales funnel

## Summary

A parody "AI longevity assessment" web app. Users take a mock-clinical lifestyle
quiz, watch a fake "analyzing your biomarkers" sequence, then receive a predicted
**death date** styled as a sterile medical report. The report reveals how many of
those lost years are *recoverable*, then funnels the user into purchasing a
low-ticket ($9–$19) fat-loss/fitness guide.

The deadpan-legit clinical look is the joke. Persistent parody disclaimers make
clear this is entertainment, not medical advice.

## Goals

- Deliver a funny, shareable "when will you die" result driven by lifestyle inputs.
- Pivot the result into a credible-feeling sales pitch for a fitness guide.
- Keep the prediction engine deterministic, offline, and unit-testable (no AI API).
- Structure the checkout so real Stripe can be wired in later with minimal change.

## Non-Goals

- No real medical/actuarial accuracy.
- No real AI model call (the "AI" is a deterministic engine + theatrical UI).
- No working payment processing in v1 (placeholder Buy button only).
- No email capture / accounts in v1.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Input | Lifestyle quiz, with **age** as the anchor question |
| "Brains" | Fake **client-side deterministic** engine + theatrical analyzing UI |
| Tone | **Mock-serious clinical** (fake longevity scan) |
| Funnel goal | Sell the fitness guide directly |
| The guide | Build a **persuasive landing section** (placeholder name) |
| Price point | **Low ticket ($9–$19)** placeholder |
| Output | Specific **death date** (age-anchored) + recoverable years |
| Checkout | **Placeholder** Buy button; Stripe wired later |
| Visual theme | **Dark "diagnostic monitor"** — near-black, glowing teal/green, red flatline reveal |
| Stack | Next.js App Router + TypeScript + Tailwind v4 + shadcn/ui + Motion |

## Architecture

### Core unit — `lib/longevity.ts` (pure, deterministic, TDD)

The single source of truth for the "AI". No network, no React, fully unit-tested.

**Types**
- `QuizOption` — `{ label: string; yearsDelta: number; recoverable: boolean }`
- `QuizQuestion` — `{ id, prompt, kind: "age" | "choice", options?, ... }`
- `Answers` — map of `questionId -> selected value`
- `RiskFactor` — `{ label: string; deltaYears: number; recoverable: boolean }`
- `ScanResult` — `{ currentAge, lifeExpectancy, ageAtDeath, predictedDeathDate,
  totalDelta, factors: RiskFactor[], recoverableYears }`

**Config — `QUESTIONS`**
Each non-age option carries a `yearsDelta` and a `recoverable` flag.

1. **Age** (`kind: "age"`, anchor — number input, validated)
2. **Activity level** — sedentary → very active *(recoverable)*
3. **Diet quality** — junk → clean *(recoverable)*
4. **Sleep** — hours/night band *(recoverable)*
5. **Smoking / vaping** — none → heavy *(recoverable)*
6. **Alcohol** — none → heavy *(recoverable)*
7. **Stress level** — low → constant *(recoverable)*
8. **Joke wildcard** — e.g. energy drinks per day *(recoverable, comedic)*

**`computeResult(answers): ScanResult`**
- `BASE_LIFE_EXPECTANCY = 79` (single named constant, easy to tune)
- `totalDelta = Σ yearsDelta` of selected options (excludes age)
- `lifeExpectancy = clamp(BASE_LIFE_EXPECTANCY + totalDelta, currentAge + 1, 105)`
- `ageAtDeath = lifeExpectancy`
- `predictedDeathDate = today + (lifeExpectancy − currentAge) years`
- `factors` = per-question breakdown for the report table
- `recoverableYears = −Σ (negative deltas of recoverable factors)` → the sales hook
  ("Our protocol could give you back ~X years")

### Pages (Next.js App Router)

- `app/page.tsx` — clinical hero, prominent disclaimer, "Begin Assessment" CTA → `/scan`.
- `app/scan/page.tsx` — client step-machine:
  `QuizStep` (one question per screen + progress bar)
  → `AnalyzingSequence` (fake medical log lines + progress)
  → `ReportCard` (the result + pivot).
- `app/guide/page.tsx` — standalone `GuidePitch` page (also reachable from the report CTA).

### Components

- `QuizStep` — renders one `QuizQuestion`; emits the answer; blocks advance until answered.
- `AnalyzingSequence` — theatrical fake-AI: timed pseudo-medical log lines
  ("Cross-referencing actuarial tables… analyzing metabolic markers…") + progress, then resolves.
- `ReportCard` — dramatic predicted death date, age-at-death, a **Risk Factor Breakdown**
  table (red = costing years, green = helping), and the **recoverable-years callout → CTA**.
- `GuidePitch` — persuasive low-ticket fitness-guide section; placeholder name/price;
  contains the `CheckoutButton`.
- `CheckoutButton` — isolated placeholder. Non-functional "Buy" in v1; swapping in Stripe
  (API route *or* Payment Link) is a one-file change.
- `Disclaimer` / `SiteFooter` — persistent parody disclaimer on every page + on the report.

## Data flow

`QUESTIONS` (config) → `QuizStep` collects `Answers` (client state in `/scan`)
→ `computeResult(answers)` → `ScanResult` → `ReportCard` + `GuidePitch`.
All state is ephemeral client state; nothing persisted in v1.

## Visual direction (mock-clinical — "dark diagnostic monitor")

Locked via the `design-taste-frontend` skill. **Design read:** parody mock-clinical
longevity-assessment funnel for a general consumer audience, sterile medical-instrument
language that deadpans into a sales pivot.

- **Theme (LOCKED):** dark "patient monitor in a dim room." One theme for the whole page
  (Page Theme Lock) — near-black slate base, glowing teal/green readouts, red "flatline"
  alert state for the death reveal. No light-mode sections mid-page.
- **Dials:** `DESIGN_VARIANCE: 5` · `MOTION_INTENSITY: 6` · `VISUAL_DENSITY: 5`.
- **Color:** near-black slate base (no pure `#000`); **one locked brand accent: clinical
  teal/cyan**, used identically across all sections (Color Consistency Lock). A **semantic
  warning state (amber→red)** is reserved strictly for death/risk data (allowed
  semantic-state exception, not a second brand color). No AI-purple.
- **Type:** `Geist` + `Geist Mono` via `next/font`. **Mono carries every number/readout**
  (life expectancy, death date, risk deltas) for the instrument feel.
- **Motion (all motivated, honor `prefers-reduced-motion`):** scanning line + typing
  pseudo-medical log lines + metric count-ups during "analyzing"; count-up on the final
  age/date reveal; risk bars animate in. Implement with Motion (`motion/react`); isolate in
  `'use client'` leaf components.
- **Components:** shadcn/ui primitives (Button, Progress, RadioGroup, Badge), customized to
  the dark-monitor aesthetic — never shipped in default state. Cards used only where
  elevation communicates real hierarchy.
- **Per-screen:** hero = asymmetric split (deadpan headline + CTA / instrument gauge visual);
  quiz = full-screen one-question steps with a "vitals/scan" progress meter; analyzing =
  full-screen instrument readout; report = dramatic mono date + age reveal, red-flatline
  risk breakdown, recoverable-years callout → CTA; guide pitch = personalized hook, varied
  benefit layout (not 3 equal cards), price, placeholder Buy button.
- **AI-tell guardrails (from the skill):** zero em-dashes in any UI copy; eyebrow restraint
  (≤ ceil(sections/3)); no scroll cues; no decorative status dots; no div-based fake
  screenshots (generate or source real instrument imagery); hero ≤ 2-line headline + ≤ 20-word
  subtext with CTA above the fold.

## Error handling

- Client app, minimal surface. Age input validated (sensible bounds, e.g. 13–100).
- Quiz cannot advance past an unanswered question.
- `lifeExpectancy` clamped so the death date is always in the future and plausible.

## Testing

- **TDD** `lib/longevity.ts`: scoring sums, clamping (young/old edge cases), date math,
  recoverable-years calculation, determinism.
- UI kept light; **optional** Playwright smoke test of the full landing → report flow.

## Future / out of scope (noted, not built)

- Real Stripe checkout (API route or Payment Link) behind `CheckoutButton`.
- Email capture / list building.
- Shareable result URLs (encode result in querystring).
- Real product content for the guide.
