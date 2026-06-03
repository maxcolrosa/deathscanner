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
| Stack | Next.js App Router + TypeScript + Tailwind + shadcn/ui |

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

## Visual direction (mock-clinical)

- Sterile white / slate surfaces; one accent color that shifts to **warning amber/red**
  on the death reveal for dramatic effect.
- Monospace for "data"/report numbers; clean sans for body copy.
- shadcn/ui primitives: Card, Progress, Button, RadioGroup, Badge.
- UI work runs through the design-taste frontend workflow at build time (per global config).
  Note: if the `design-taste-frontend` skill is unavailable in this environment, fall back
  to `vercel:shadcn` guidance + deliberate visual taste, and flag the gap.

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
