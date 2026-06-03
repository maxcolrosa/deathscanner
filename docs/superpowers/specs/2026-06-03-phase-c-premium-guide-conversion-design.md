# Phase C - Premium Guide + Conversion & Social Proof (Design)

Date: 2026-06-03
Status: Approved (pending written-spec review)
Related: `docs/superpowers/specs/2026-06-03-phase-b-generated-guide-design.md`, `AppState.md`

## Goal

Two outcomes, packaged as ONE spec built as TWO sequential plans (guide quality first):

1. **Make the generated guide genuinely worth paying for** - specific, prescriptive, personalized,
   actionable coaching, not generic information available free from Google or ChatGPT. It must
   tell the user exactly what to do.
2. **Raise conversion with credible social proof and a frictionless CTA** - customer reviews and
   realistic before/after transformation images on the landing page and the building page, and a
   result page whose primary CTA takes the user straight to checkout with no scroll-jump.

## Resolved decisions (from brainstorming)

- **Guide model:** stay on `claude-sonnet-4-6`; greatly expand the `GuideDoc` schema and rewrite
  the prompt for premium depth. Raise `max_tokens`. (Not Opus, not two-pass.)
- **Result page CTA:** offer block at the top of the report (above the fold) with a 1-click CTA
  that starts checkout directly and routes to the building page. The detailed `GuidePitch` stays
  below for scrollers but is no longer a smooth-scroll jump target.
- **Packaging:** one spec, two plans, **guide quality first**, then conversion + images.
- **Images:** generated at BUILD time with the Higgsfield MCP into `public/transformations/`,
  then served as static assets. No runtime MCP dependency. 2 female + 2 male before/after pairs,
  with the "after" clearly fitter/leaner/healthier.
- **Higgsfield connection:** the remote MCP server is added (user scope); the user completes the
  OAuth via `/mcp`. Plan 1 needs nothing from it; only Plan 2's image step depends on it.
- **Disclosure:** reviews and before/after imagery are disclosed as illustrative / AI-generated in
  `/terms` only (already present from Phase B: "shown anywhere on this site"). No disclaimer in the
  product UI.
- **Constraints carried:** locked dark-monitor theme + `monitor-*` tokens; all UI work through the
  `design-taste-frontend-v1` skill; no em-dashes in user-facing strings; shadcn is base-ui
  (`Button` has no `asChild`); keep `computeResult` deterministic; Next 16 async params + `after`.

---

## Plan 1 - Guide Quality Overhaul

The current `GuideDoc` is high-level (a focus line, a few session strings, an eat-list). It reads
generic. We make it a bespoke, prescriptive coaching document, still produced by the deterministic
engine + Sonnet 4.6 + the `emit_guide` structured-output tool.

### Expanded `GuideDoc` (zod source of truth in `lib/guide/schema.ts`)

- `title`
- `intro` - personalized narrative.
- `yourSituation` - an honest read of where they are, citing their actual answers (age, top risks,
  projected-date movement).
- `strategy` - why this plan attacks their specific risks first, in order.
- `weeks` (exactly 8), each:
  - `week` (1..8), `theme`, `focus`
  - `workouts[]` - per session: `day`, `title`, `exercises[]` where each exercise has `name`,
    `sets`, `reps`, `rest`, `cues`, `progression`.
  - `nutritionFocus` - the week's eating emphasis (specific).
  - `habit` - `{ name, trigger, why }` (one keystone habit to install this week).
  - `checkpoint` - how to tell it is working.
- `nutritionPlan`:
  - `principles[]` - specific (e.g., a protein target derived from the body-composition answer,
    meal timing).
  - `sampleDay` - `{ breakfast, lunch, dinner, snacks }` with real foods and rough portions.
  - `swaps[]` - `{ from, to }` specific to their current diet level.
  - `groceryStaples[]`.
- `dailyBlueprint[]` - a time-blocked example day (`{ time, activity }`), shaped to the training
  barrier, sleep, and stress answers.
- `sleepAndStress` - `{ summary, protocol[] }`, step-by-step with times, tuned to their answers.
- `tenMinutePlan` - `{ summary, movements[] }` (each `{ name, detail }`), shaped by
  `activity_barrier`.
- `next7Days[]` - `{ day, action }` for each of the first 7 days (low-friction onboarding so they
  can act immediately).
- `troubleshooting[]` - `{ problem, fix }`, matched to their likely failure points.
- `recalibration` - how to adjust as numbers improve.
- `outcomes[]` - concrete promised results (goal-aligned).
- `closing` - a personal, motivating close.

All arrays carry sensible min lengths; `weeks` is exactly length 8. The schema must remain
convertible via `z.toJSONSchema` for the tool's `input_schema`.

### Prompt rewrite (`lib/guide/prompt.ts`)

- Persona: an elite strength and longevity coach who personally reviewed this person's scan.
- Mandate: be specific and prescriptive; give real exercises with sets, reps, and progressions;
  real foods with rough portions; tell them exactly what to do. Calibrate to their level (true
  beginner if sedentary or "never learned"; low-impact progressions if `barrier=injury`;
  time-efficient sessions if `barrier=time`; accountability framing if `barrier=motivation`).
  Reference their actual answers throughout. Explicitly forbid generic filler and anything they
  could get free from a search engine. No medical claims, no calorie obsession, no em-dashes.
- Inputs surfaced to the model: age, primary goal, training barrier, the ordered top risks
  (category + answer + clinical reason), strengths, every scored factor and the user's answer,
  recoverable years, and the promised outcomes.

### Generation

- `lib/guide/model.ts`: raise `max_tokens` (e.g. 16000) to allow the depth; everything else
  unchanged (cached system prompt, single `emit_guide` tool, `tool_choice` forced). `generate.ts`
  and `orders.ts` are unchanged (the repair-retry and stub paths still apply).
- `lib/guide/fixture.ts`: expand the deterministic stub to produce a valid doc in the new shape so
  the whole pipeline stays testable offline.

### Rendering

- `components/guide/guide-view.tsx`: render the richer document in the dark-monitor theme, through
  `design-taste-frontend-v1`. Sections in a sensible reading order; the 8-week plan with per-set
  exercise detail; nutrition with the sample day; the daily blueprint; the first-7-days quickstart;
  troubleshooting. Keep the existing "Download your PDF" affordance and the `{ guide, token }`
  prop signature.
- `components/guide/guide-pdf.tsx`: render the same expanded structure to the PDF.

### Tests (Plan 1)

- `schema.test.ts` - accept a fully-formed rich guide, reject a too-short `weeks`, reject a missing
  section, reject a malformed exercise.
- `fixture.test.ts` - the stub is schema-valid, deterministic, and leads week 1 with the top risk.
- `prompt.test.ts` - the user prompt carries the personalization signals; the system prompt states
  the specificity mandate and the no-em-dash rule.
- `generate.test.ts` - unchanged behavior (stub path, model path mocked, invalid -> failed, repair
  retry, idempotent).
- Full loop: `npm test && npx tsc --noEmit && npm run lint && npm run build`.

---

## Plan 2 - Conversion + Social Proof + Images

### 2a. Higgsfield transformation assets (build-time)

Once the Higgsfield MCP is authenticated, generate **2 female + 2 male** realistic before/after
transformations (the "after" clearly fitter, leaner, healthier), save them under
`public/transformations/` (separate `before` and `after` files per person), and record the
generation prompts in the plan for reproducibility. Also expand the review/testimonial set.

Update `lib/guide/testimonials.ts`:
- `TESTIMONIALS` - keep/extend the written reviews (name + quote + a concrete stat).
- `TRANSFORMATIONS` - `{ name, weeks, beforeSrc, afterSrc, stat, caption }` pointing at the real
  assets (replacing the placeholder slots).

Fallback if realistic human imagery is refused or looks off: lifestyle/silhouette-style
transformations, or labeled placeholder frames until real assets are supplied. Surface the issue
rather than ship something off-looking.

### 2b. Landing page (`app/page.tsx`)

Keep the hero and its primary CTA. Below it, add:
- A **reviews** section (from `TESTIMONIALS`).
- A **before/after transformations** gallery (real images, after clearly better).
- A closing CTA so the action stays easy to reach after the social proof.

Build reusable `components/reviews.tsx` and `components/transformations-gallery.tsx` (shared with
the building page). All through `design-taste-frontend-v1`, dark-monitor theme, no em-dashes.

### 2c. Building page (`components/guide/guide-building-screen.tsx`)

- Replace the placeholder transformation slots with the real before/after images (reuse
  `TransformationsGallery` or its presentation).
- Add **rotating status text** that cycles through phases over time ("Analyzing your risk
  factors", "Designing your training block", "Building your nutrition reset", "Personalizing your
  routine", "Finalizing your protocol"), alongside the existing progress bar and elapsed timer.
  Cosmetic and time-based (client-side), in the spirit of the existing analyzing sequence. Preserve
  the polling, the `{ token, failed }` props, and the failed-state panel with manual retry.

### 2d. Result page CTA (the "no jump" fix)

- `components/report-card.tsx`: add an **above-the-fold offer block** (recoverable years + live
  price from `useSale()` + primary CTA). The CTA starts checkout directly and routes to
  `/guide/[token]`. Reuse the existing `CheckoutButton` (which already encapsulates the action,
  pending/error states, and the redirect) by threading `answers` into `ReportCard`.
- `components/result-sticky-bar.tsx`: its CTA also starts checkout directly (thread `answers`).
- `app/scan/page.tsx`: pass `answers` to `ReportCard` and `ResultStickyBar`; remove the
  `onSeePlan`/`scrollToPitch`/`pitchRef` smooth-scroll plumbing.
- `GuidePitch` stays below for scrollers; its own `CheckoutButton` already converts directly.

### Tests (Plan 2)

- `e2e/smoke.spec.ts`: update for the new report CTA (it starts checkout directly rather than
  scrolling) and the building-screen rotating text; keep the purchase -> building -> guide -> PDF
  assertions. Landing still reachable via the hero CTA.
- Components remain covered by e2e (node-env vitest does not render React here, per the existing
  testing approach).

---

## Build order and dependencies

1. **Plan 1 (guide quality)** - no external dependency; fully testable on the stub. Build first.
2. **Plan 2 (conversion + images)** - 2b/2c/2d can be built with images dropped in last; 2a is
   blocked only on the Higgsfield OAuth. Build second.

## Out of scope

- Real Stripe payment (still Phase D territory; the `startGuideGeneration`/`generateGuide` seam is
  reused as-is).
- Per-user generated imagery (transformations are a fixed shared set).
- Email delivery, auth, analytics.
