# Phase C - Plan 2: Conversion + Social Proof + Images (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise conversion with credible social proof (customer reviews + realistic before/after transformation images) on the landing and building pages, and make the result page convert with a one-click, no-scroll CTA.

**Architecture:** Add a shared transformation/review data module and two reusable presentation components (`Reviews`, `TransformationsGallery`) used by both the landing page and the building screen. Extract the checkout action into a `useCheckout` hook so the report card and sticky bar can start checkout directly (no smooth-scroll jump). Generate a fixed set of before/after images with the Higgsfield MCP at build time into `public/transformations/`.

**Tech Stack:** React 19 / Next 16 (App Router, `next/image`), TypeScript, Tailwind v4 (dark-monitor theme), Higgsfield MCP (image generation, build-time only), vitest, Playwright. UI through `design-taste-frontend-v1`; no em-dashes.

**Spec:** `docs/superpowers/specs/2026-06-03-phase-c-premium-guide-conversion-design.md` (Plan 2 section).

**Branch:** `feat/phase-c-premium-guide` (continues from Plan 1).

---

## Notes that affect sequencing

- **Higgsfield image generation (Task 7) is gated** on the Higgsfield MCP tools being live in the session. Tasks 1-6 and 8 do NOT need it: they reference image paths under `/transformations/` that simply 404 until the assets land. The build, lint, type-check, and e2e all pass with the images absent (a missing `next/image` src 404s at runtime; it does not fail the build or the smoke test, which makes no assertion on the images).
- The disclosure that reviews/images are illustrative / AI-generated already lives in `/terms` ("shown anywhere on this site"). Do NOT add any disclaimer to the landing, building, or result UI.
- Keep the existing e2e green; Task 8 updates it for the new result-page CTA.

---

## File Structure

- `lib/guide/testimonials.ts` - rewrite: richer `TESTIMONIALS` + `TRANSFORMATIONS` (with real image paths, name, weeks, stat).
- `components/reviews.tsx` - new: renders the review list. Shared by landing + (optionally) building.
- `components/transformations-gallery.tsx` - new: renders before/after image cards. Shared by landing + building.
- `components/use-checkout.ts` - new: client hook encapsulating `startGuideGeneration(answers)` + pending/error + redirect.
- `components/checkout-button.tsx` - refactor to use `useCheckout`.
- `components/report-card.tsx` - add `answers` prop + an above-the-fold offer block whose CTA starts checkout directly; drop `onSeePlan`.
- `components/result-sticky-bar.tsx` - `answers` prop; CTA starts checkout directly; drop `onGetPlan`.
- `app/scan/page.tsx` - pass `answers` to `ReportCard`/`ResultStickyBar`; remove the scroll plumbing.
- `components/guide/guide-building-screen.tsx` - rotating status text + real transformations gallery.
- `app/page.tsx` - add reviews + transformations + a closing CTA below the hero.
- `public/transformations/*.jpg` - generated assets (Task 7).
- `e2e/smoke.spec.ts` - update for the new result CTA (Task 8).

---

## Task 1: Transformation and review data

**Files:**
- Rewrite: `lib/guide/testimonials.ts`

No unit test (static data); consumed by components verified via build + e2e.

- [ ] **Step 1: Replace the entire contents of `lib/guide/testimonials.ts` with:**
```ts
export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

export interface Transformation {
  name: string;
  weeks: number;
  beforeSrc: string;
  afterSrc: string;
  stat: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { quote: "I stopped dreading mornings. The plan was short enough that I actually did it.", name: "Daniel R.", detail: "Down 7 kg in 8 weeks" },
  { quote: "My scan scared me. This gave me something to do about it, step by step.", name: "Priya M.", detail: "Resting heart rate down 11 bpm" },
  { quote: "First program I have ever finished. The weekly recalibration kept it honest.", name: "Marcus T.", detail: "Sleeping a full hour longer" },
  { quote: "The 10-minute fallback fit a life with two kids and a job. No more all-or-nothing.", name: "Elena K.", detail: "Back to lifting after years off" },
  { quote: "The grocery list and sample day took all the guesswork out of eating.", name: "Tom B.", detail: "Lost the gut he had for a decade" },
  { quote: "It felt like it was written for me, because it was. It used my actual answers.", name: "Sarah L.", detail: "Energy back by week three" },
];

// Fixed shared set. The image files are generated into /public/transformations/
// at build time (see Plan 2, Task 7). 2 female, 2 male.
export const TRANSFORMATIONS: Transformation[] = [
  { name: "Priya M.", weeks: 10, beforeSrc: "/transformations/priya-before.jpg", afterSrc: "/transformations/priya-after.jpg", stat: "10 weeks" },
  { name: "Daniel R.", weeks: 8, beforeSrc: "/transformations/daniel-before.jpg", afterSrc: "/transformations/daniel-after.jpg", stat: "8 weeks" },
  { name: "Elena K.", weeks: 12, beforeSrc: "/transformations/elena-before.jpg", afterSrc: "/transformations/elena-after.jpg", stat: "12 weeks" },
  { name: "Marcus T.", weeks: 8, beforeSrc: "/transformations/marcus-before.jpg", afterSrc: "/transformations/marcus-after.jpg", stat: "8 weeks" },
];
```

- [ ] **Step 2: Verify nothing that imports this broke at build-time later** (the building screen currently imports `TESTIMONIALS`/`TRANSFORMATIONS`; its usage is rewritten in Task 5). For now just confirm the file type-checks in isolation:

Run: `npx tsc --noEmit`
Expected: It will report errors in `components/guide/guide-building-screen.tsx` because the old `Transformation` shape (`{ weeks, caption }`) changed to `{ name, weeks, beforeSrc, afterSrc, stat }`. That is expected and fixed in Task 5. If you see ONLY that file erroring, proceed. (Do not "fix" the building screen here.)

- [ ] **Step 3: Commit**
```bash
git add lib/guide/testimonials.ts
git commit -m "feat: richer reviews and before/after transformation data"
```

---

## Task 2: Reviews and TransformationsGallery components

**Files:**
- Create: `components/reviews.tsx`
- Create: `components/transformations-gallery.tsx`

> UI sub-skill: refine with `design-taste-frontend-v1` after the baseline compiles. Dark-monitor theme, `monitor-*` tokens, no em-dashes. No AI/illustrative disclaimer (it lives in /terms).

- [ ] **Step 1: Create `components/reviews.tsx`**
```tsx
import { TESTIMONIALS } from "@/lib/guide/testimonials";

export function Reviews({ heading = "What people say" }: { heading?: string }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          {heading}
        </span>
        <span className="h-px flex-1 bg-monitor-line" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col gap-3 rounded-lg border border-monitor-line bg-monitor-panel p-5"
          >
            <blockquote className="text-sm leading-relaxed text-monitor-fg">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="font-mono text-xs text-monitor-muted">
              <span className="text-monitor-fg">{t.name}</span>
              <span className="text-monitor-accent"> {"//"} </span>
              {t.detail}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/transformations-gallery.tsx`**
```tsx
import Image from "next/image";
import { TRANSFORMATIONS } from "@/lib/guide/testimonials";

function Frame({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-md border border-monitor-line bg-monitor-bg">
      <Image src={src} alt={`${label} transformation photo`} fill className="object-cover" sizes="(max-width: 640px) 45vw, 180px" />
      <span className="absolute left-2 top-2 rounded bg-monitor-bg/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-monitor-muted">
        {label}
      </span>
    </div>
  );
}

export function TransformationsGallery({
  heading = "Real results from the protocol",
}: {
  heading?: string;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          {heading}
        </span>
        <span className="h-px flex-1 bg-monitor-line" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {TRANSFORMATIONS.map((t) => (
          <div
            key={t.name}
            className="flex flex-col gap-3 rounded-lg border border-monitor-line bg-monitor-panel p-4"
          >
            <div className="flex gap-2">
              <Frame src={t.beforeSrc} label="Before" />
              <Frame src={t.afterSrc} label="After" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-monitor-fg">{t.name}</span>
              <span className="font-mono text-xs text-monitor-accent">{t.stat}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Apply `design-taste-frontend-v1`** to both components (presentation only; keep the exports, props, and the `next/image` usage). No em-dashes.

- [ ] **Step 4: Commit** (do not run full build yet; the building screen still references the old data shape until Task 5)
```bash
git add components/reviews.tsx components/transformations-gallery.tsx
git commit -m "feat: reusable Reviews and TransformationsGallery components"
```

---

## Task 3: useCheckout hook + refactor CheckoutButton

**Files:**
- Create: `components/use-checkout.ts`
- Rewrite: `components/checkout-button.tsx`

- [ ] **Step 1: Create `components/use-checkout.ts`**
```ts
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startGuideGeneration } from "@/lib/guide/start";
import type { Answers } from "@/lib/longevity";

// Shared checkout action: starts guide generation and routes to the building
// page. `answers` is undefined on the generic /guide page, where there is no
// scan to build from; callers handle that case (see `ready`).
export function useCheckout(answers?: Answers) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const ready = Boolean(answers);

  const start = () => {
    if (!answers) return;
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

  return { start, pending, error, ready };
}
```

- [ ] **Step 2: Rewrite `components/checkout-button.tsx` to use the hook (replace the whole file)**
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSale } from "@/components/sale-context";
import { useCheckout } from "@/components/use-checkout";
import type { Answers } from "@/lib/longevity";

// When `answers` is provided (the result page), clicking starts real guide
// generation and redirects to the tokenized guide URL. Without `answers` (the
// generic /guide page), it keeps the placeholder message.
export function CheckoutButton({ label, answers }: { label?: string; answers?: Answers }) {
  const { price } = useSale();
  const { start, pending, error, ready } = useCheckout(answers);
  const [placeholder, setPlaceholder] = useState(false);
  const text = label ?? `Get instant access for $${price}`;

  const onClick = () => {
    if (!ready) {
      setPlaceholder(true);
      return;
    }
    start();
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

- [ ] **Step 3: Verify the unit suite is unaffected**

Run: `npm test`
Expected: all pass (no test imports these). Do NOT rely on `tsc`/build yet (building screen + report wiring still pending).

- [ ] **Step 4: Commit**
```bash
git add components/use-checkout.ts components/checkout-button.tsx
git commit -m "feat: extract useCheckout hook; checkout button uses it"
```

---

## Task 4: Result page - offer block + direct CTA, no scroll-jump

**Files:**
- Rewrite: `components/report-card.tsx`
- Rewrite: `components/result-sticky-bar.tsx`
- Modify: `app/scan/page.tsx`

> UI sub-skill: refine the new offer block with `design-taste-frontend-v1`. The offer block must sit ABOVE the fold (right after the death-date panel). Keep `monitor-alert` red for mortality data only; the offer/CTA uses `monitor-accent`. No em-dashes.

- [ ] **Step 1: Rewrite `components/report-card.tsx` (replace the whole file)**
```tsx
"use client";

import { CountUp } from "@/components/count-up";
import { SaleCountdown } from "@/components/sale-countdown";
import { useSale } from "@/components/sale-context";
import { CheckoutButton } from "@/components/checkout-button";
import type { Answers, RiskFactor, ScanResult } from "@/lib/longevity";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

const IMPACT_LABEL: Record<RiskFactor["impact"], string> = {
  high: "High impact",
  moderate: "Moderate impact",
  minor: "Minor impact",
};

function buildNarrative(result: ScanResult): string {
  const [worst, second] = result.topRisks;
  const strength = result.strengths[0];
  if (!worst) {
    return "Your modifiable risks are already low. Your daily habits are doing most of the work in your favor, which is rare.";
  }
  const drivers = second
    ? `${worst.category.toLowerCase()} and ${second.category.toLowerCase()}`
    : worst.category.toLowerCase();
  const tail = strength
    ? ` Your ${strength.category.toLowerCase()} is the main thing pulling the other way.`
    : "";
  return `Most of the gap between you and the average comes down to two things: ${drivers}. The rest of your profile is closer to baseline.${tail}`;
}

export function ReportCard({ result, answers }: { result: ScanResult; answers: Answers }) {
  const { price, listPrice, expired } = useSale();
  const deathLabel = dateFormatter.format(result.predictedDeathDate);
  const years = result.recoverableYears.toFixed(0);

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-8 px-6 pt-20 pb-10">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-alert">
          AI analysis complete
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          Your estimated lifespan
        </h2>
      </div>

      <div className="rounded-lg border border-monitor-alert/40 bg-monitor-panel p-8">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
          Estimated date of death
        </div>
        <div className="mt-2 font-mono text-5xl tracking-tighter text-monitor-alert md:text-6xl">
          {deathLabel}
        </div>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-sm text-monitor-fg">
          <span>
            Around <CountUp to={result.ageAtDeath} className="text-monitor-alert" /> years old
          </span>
          <span className="text-monitor-muted">You are {result.currentAge} now</span>
          <span className="text-monitor-muted">Model confidence {result.modelConfidence}%</span>
        </div>
      </div>

      {/* Above-the-fold offer. The CTA starts checkout directly (no scroll jump). */}
      <div className="flex flex-col gap-5 rounded-lg border border-monitor-accent/40 bg-monitor-panel p-6">
        {result.recoverableYears > 0 ? (
          <p className="text-lg leading-relaxed text-monitor-fg">
            That date is not fixed. The model estimates that reversing your top risks could move it
            back by roughly{" "}
            <span className="font-mono text-monitor-accent">{years} years</span>. Your personalized
            protocol goes after them, in order.
          </p>
        ) : (
          <p className="text-lg leading-relaxed text-monitor-fg">
            Your risks are already low. Your personalized protocol pushes you toward the top of your
            range and holds it there.
          </p>
        )}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
              Today
            </span>
            <span className="font-mono text-5xl tracking-tighter text-monitor-fg">${price}</span>
            <span className="font-mono text-sm text-monitor-muted line-through">${listPrice}</span>
          </div>
          <span className="font-mono text-xs text-monitor-muted">
            {expired ? (
              "The launch price has ended."
            ) : (
              <>
                Locked in for <SaleCountdown className="text-monitor-accent" />
              </>
            )}
          </span>
        </div>
        <CheckoutButton
          label={
            result.recoverableYears > 0
              ? `Build my plan and reclaim ${years} years`
              : "Build my plan"
          }
          answers={answers}
        />
      </div>

      <p className="max-w-[60ch] text-base leading-relaxed text-monitor-fg">
        {buildNarrative(result)}
      </p>

      {result.topRisks.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            What is shortening your life
          </h3>
          <div className="flex flex-col gap-3">
            {result.topRisks.map((risk) => (
              <div key={risk.id} className="rounded-lg border border-monitor-line bg-monitor-panel p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-monitor-fg">{risk.category}</span>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-monitor-alert">
                    {IMPACT_LABEL[risk.impact]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-monitor-muted">{risk.answerLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-monitor-muted">{risk.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result.strengths.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted">
            Working in your favor
          </h3>
          <ul className="flex flex-col divide-y divide-monitor-line">
            {result.strengths.map((s) => (
              <li key={s.id} className="flex flex-col gap-1 py-3">
                <span className="text-sm font-semibold text-monitor-accent">{s.category}</span>
                <span className="text-sm leading-relaxed text-monitor-muted">{s.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: Rewrite `components/result-sticky-bar.tsx` (replace the whole file)**
```tsx
"use client";

import { useSale } from "@/components/sale-context";
import { SaleCountdown } from "@/components/sale-countdown";
import { useCheckout } from "@/components/use-checkout";
import type { Answers } from "@/lib/longevity";

// Persistent conversion bar on the result page. Its CTA starts checkout
// directly (no scroll jump), matching the report's primary CTA.
export function ResultStickyBar({
  recoverableYears,
  answers,
}: {
  recoverableYears: number;
  answers: Answers;
}) {
  const { price, expired } = useSale();
  const { start, pending } = useCheckout(answers);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-monitor-line bg-monitor-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 py-3 sm:flex-row sm:justify-between">
        <span className="text-sm text-monitor-fg">
          {recoverableYears > 0 ? (
            <>
              <span className="font-mono text-monitor-accent">
                {recoverableYears.toFixed(0)} years
              </span>{" "}
              are still on the table.
            </>
          ) : (
            <>Lock in the years you have.</>
          )}
        </span>
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <span className="hidden font-mono text-xs text-monitor-muted sm:inline">
            {expired ? (
              <>${price} now</>
            ) : (
              <>
                ${price} today, expires in <SaleCountdown className="text-monitor-accent" />
              </>
            )}
          </span>
          <button
            onClick={start}
            disabled={pending}
            className="w-full rounded-md bg-monitor-accent px-6 py-2.5 text-sm font-semibold text-monitor-bg transition-colors hover:bg-monitor-accent/90 disabled:opacity-70 sm:w-auto"
          >
            {pending ? "Building..." : "Build my plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update `app/scan/page.tsx`** to pass `answers` and drop the scroll plumbing.

Remove the `pitchRef` and `scrollToPitch` and the `onSeePlan`/`onGetPlan` props. The result-phase return becomes:
```tsx
  return (
    <SaleProvider>
      <main className="pb-24">
        <ReportCard result={result!} answers={answers} />
        <GuidePitch result={result!} answers={answers} />
        <ResultStickyBar recoverableYears={result!.recoverableYears} answers={answers} />
      </main>
    </SaleProvider>
  );
```
Also delete the now-unused `pitchRef` declaration (`const pitchRef = useRef<HTMLDivElement>(null);`), the `scrollToPitch` function, and the `useRef` import if it is no longer used elsewhere in the file. (Leave the quiz and analyzing phases untouched.)

- [ ] **Step 4: Verify the unit suite**

Run: `npm test`
Expected: all pass. (Full `tsc`/build still pends Task 5, which fixes the building screen's use of the new transformation data.)

- [ ] **Step 5: Commit**
```bash
git add components/report-card.tsx components/result-sticky-bar.tsx app/scan/page.tsx
git commit -m "feat: result page offer block with direct checkout, no scroll jump"
```

---

## Task 5: Building page - rotating status text + transformations

**Files:**
- Modify: `components/guide/guide-building-screen.tsx`

This file is already design-refined (it has `PulsingDot`, a progress bar, an elapsed timer, a placeholder `TransformationSlot`, a `FailedPanel`, and a polling effect). READ it first. Make three changes, preserving the polling, the `{ token, failed }` props, and the failed-state panel:

1. Replace the inline placeholder transformation slots with the shared `TransformationsGallery` (real images).
2. Add rotating status text that cycles through phases over time.
3. Keep the testimonials (you may switch them to the shared `Reviews` component or leave the existing inline list; either is fine, but do not remove social proof).

- [ ] **Step 1: Add a rotating-status component and imports**

At the top of the file, add imports:
```tsx
import { TransformationsGallery } from "@/components/transformations-gallery";
```
Add this component above `GuideBuildingScreen`:
```tsx
const BUILD_PHASES = [
  "Analyzing your risk factors",
  "Designing your training block",
  "Building your nutrition reset",
  "Personalizing your daily routine",
  "Writing your first 7 days",
  "Finalizing your protocol",
];

function RotatingStatus({ elapsed }: { elapsed: number }) {
  // Advance one phase every 4 seconds, holding on the last one.
  const index = Math.min(BUILD_PHASES.length - 1, Math.floor(elapsed / 4));
  return (
    <span className="font-mono text-xs text-monitor-muted">
      {BUILD_PHASES[index]}
      <span className="text-monitor-accent">...</span>
    </span>
  );
}
```

- [ ] **Step 2: Render the rotating status near the progress bar**

In the building (non-failed) return, where the elapsed time is shown next to the progress bar, render `<RotatingStatus elapsed={elapsed} />` (keep the existing percentage/elapsed display; place the rotating status on its own line directly beneath the progress track). The component already tracks `elapsed` in state via the existing 1-second tick.

- [ ] **Step 3: Replace the placeholder transformation slots**

Remove the old `TransformationSlot` placeholder grid (the section that mapped `TRANSFORMATIONS` to placeholder frames, and the `TransformationSlot` helper if it is now unused) and render the shared gallery instead, in the same position:
```tsx
<TransformationsGallery />
```
If the file still imports `TRANSFORMATIONS` only for the removed slots, remove that now-unused import. Keep the `TESTIMONIALS` usage (or swap to `<Reviews />`).

- [ ] **Step 4: Run the FULL type/lint/build (this is the first task where the whole tree is consistent again)**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: clean. Fix any residual references to the old `Transformation` shape (`caption`) or the removed `TransformationSlot`. Resolve any unused-import lint errors.

- [ ] **Step 5: Commit**
```bash
git add components/guide/guide-building-screen.tsx
git commit -m "feat: building screen rotating status text and real transformations"
```

---

## Task 6: Landing page social proof

**Files:**
- Modify: `app/page.tsx`

> UI sub-skill: refine with `design-taste-frontend-v1`. Keep the existing hero and its "Begin AI Assessment" CTA. Add the social proof below, then a closing CTA so the action stays reachable after the scroll. Dark-monitor theme, no em-dashes.

- [ ] **Step 1: Rewrite `app/page.tsx` (replace the whole file)**
```tsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MonitorVisual } from "@/components/monitor-visual";
import { Reviews } from "@/components/reviews";
import { TransformationsGallery } from "@/components/transformations-gallery";
import { cn } from "@/lib/utils";

function BeginCta({ className }: { className?: string }) {
  return (
    <Link
      href="/scan"
      className={cn(
        buttonVariants({ variant: "default" }),
        "bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90",
        className
      )}
    >
      Begin AI Assessment
    </Link>
  );
}

export default function Home() {
  return (
    <main className="px-6">
      <section className="mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-12 py-20 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent">
            AI Longevity Scan
          </span>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tighter text-monitor-fg md:text-6xl">
            Find out when
            <br />
            you will die.
          </h1>
          <p className="max-w-[48ch] text-base leading-relaxed text-monitor-muted">
            Our AI longevity model weighs your lifestyle against millions of actuarial records to
            estimate your date of death. Then it shows you how to move it.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <BeginCta />
            <span className="font-mono text-xs text-monitor-muted">Takes about 90 seconds</span>
          </div>
        </div>

        <MonitorVisual />
      </section>

      <section className="mx-auto flex max-w-5xl flex-col gap-16 border-t border-monitor-line py-20">
        <TransformationsGallery />
        <Reviews />
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="max-w-[48ch] text-lg leading-relaxed text-monitor-fg">
            See your number, then get the plan that moves it.
          </p>
          <BeginCta />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Apply `design-taste-frontend-v1`** to the new landing sections (presentation only; keep the hero, the `/scan` CTA, and the components' usage). No em-dashes.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: clean.

- [ ] **Step 4: Commit**
```bash
git add app/page.tsx
git commit -m "feat: landing page reviews, transformations, and closing CTA"
```

---

## Task 7: Generate the Higgsfield transformation images (GATED on live MCP tools)

**Files:**
- Create: `public/transformations/{priya,daniel,elena,marcus}-{before,after}.jpg` (8 files)

**Precondition:** the Higgsfield MCP tools must be available in the session (verify with a tool search for "higgsfield"; if none are present, STOP and report BLOCKED so the controller can have the user reconnect/restart Claude Code). Do not invent an image pipeline or use another provider.

- [ ] **Step 1: Inspect the Higgsfield tool surface** and identify the image-generation tool and its parameters (prompt, size/aspect, output retrieval). Use an aspect ratio close to 3:4 (portrait) to match the gallery frames.

- [ ] **Step 2: Generate 4 people, before + after each (2 female, 2 male).** Keep each person's before/after visually consistent (same individual, same framing, plain background, full or three-quarter body, gym/neutral clothing). The "after" must look clearly fitter, leaner, and healthier than the "before". Suggested prompts (adapt to the tool's parameters):
  - Priya (female) BEFORE: "Photorealistic full-body portrait of a South Asian woman in her late 30s, slightly overweight, soft posture, plain light-grey studio background, neutral athletic clothing, even lighting, candid documentary style."
  - Priya AFTER: "Photorealistic full-body portrait of the same South Asian woman in her late 30s, now lean and toned and visibly fitter, confident upright posture, same plain light-grey studio background, same neutral athletic clothing, even lighting."
  - Daniel (male) BEFORE: "Photorealistic full-body portrait of a white man in his early 40s, carrying excess weight around the midsection, tired posture, plain light-grey studio background, plain t-shirt and shorts, even lighting."
  - Daniel AFTER: "Photorealistic full-body portrait of the same white man in his early 40s, now lean and athletic with visible muscle tone, energetic upright posture, same plain background and clothing, even lighting."
  - Elena (female) BEFORE: "Photorealistic full-body portrait of a white woman in her late 40s, out of shape, plain light-grey studio background, neutral workout clothes, even lighting."
  - Elena AFTER: "Photorealistic full-body portrait of the same white woman in her late 40s, now toned, strong, and visibly healthier, upright confident posture, same background and clothing, even lighting."
  - Marcus (male) BEFORE: "Photorealistic full-body portrait of a Black man in his late 30s, overweight, relaxed posture, plain light-grey studio background, plain t-shirt and shorts, even lighting."
  - Marcus AFTER: "Photorealistic full-body portrait of the same Black man in his late 30s, now lean and muscular and visibly fitter, strong upright posture, same background and clothing, even lighting."

- [ ] **Step 3: Save outputs** to the exact paths referenced by `lib/guide/testimonials.ts`:
  `public/transformations/priya-before.jpg`, `priya-after.jpg`, `daniel-before.jpg`, `daniel-after.jpg`, `elena-before.jpg`, `elena-after.jpg`, `marcus-before.jpg`, `marcus-after.jpg`. Download the generated images to these paths (use the tool's returned URL + a fetch/curl if needed). Keep each file a reasonable web size (resize to roughly 600px wide if they come back larger).

- [ ] **Step 4: Verify the assets load**

Run: `npm run build` (confirms nothing broke) and confirm all 8 files exist:
```bash
ls -1 public/transformations/
```
Expected: the 8 files listed.

**Fallback (only if Higgsfield refuses realistic human transformation imagery or the results look off):** report it. Do NOT ship distorted or off-looking people. The agreed fallbacks are lifestyle/silhouette-style transformation imagery or keeping labeled placeholder frames until the user supplies assets. Surface the issue to the controller rather than choosing a fallback unilaterally.

- [ ] **Step 5: Commit**
```bash
git add public/transformations
git commit -m "feat: AI-generated before/after transformation assets"
```

---

## Task 8: Verification and e2e update

**Files:**
- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Update the purchase test's CTA click.** The result page's primary CTA is now in the report card and reads "Build my plan ..." Open `e2e/smoke.spec.ts` and, in the "buying builds and shows the generated guide" test, replace the buy click:
```ts
  await page.getByRole("button", { name: /get instant access/i }).first().click();
```
with:
```ts
  await page.getByRole("button", { name: /build my plan/i }).first().click();
```
Leave the rest of that test (building screen, guide view "Your 8-week plan", "Download your PDF" link, PDF endpoint) unchanged. Leave the first test (scan -> report) unchanged.

- [ ] **Step 2: Run the full loop**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all PASS, clean.

- [ ] **Step 3: Run the e2e (hermetic)**

Run: `npm run e2e`
Expected: BOTH tests pass. (Transformation images may 404 during e2e if Task 7 has not run yet; the smoke test makes no assertion on them, so it still passes.)

- [ ] **Step 4: Commit**
```bash
git add e2e/smoke.spec.ts
git commit -m "test: e2e clicks the report's direct checkout CTA"
```

---

## Self-Review

**Spec coverage (Plan 2 section):**
- 2a Higgsfield transformation assets, 2F+2M, build-time, /public, fallback noted -> Task 7. Covered.
- Reviews + transformations data and reusable components -> Tasks 1, 2. Covered.
- 2b Landing page: hero kept, reviews + transformations + closing CTA below -> Task 6. Covered.
- 2c Building page: real images + rotating status text, polling/props/failed-panel preserved -> Task 5. Covered.
- 2d Result CTA: above-the-fold offer, direct checkout via reused checkout action, answers threaded into ReportCard + ResultStickyBar, scroll plumbing removed, GuidePitch stays below -> Tasks 3, 4. Covered.
- e2e updated for the new CTA -> Task 8. Covered.
- Disclosure stays in /terms only; no UI disclaimer -> honored across Tasks 2, 5, 6. Covered.

**Placeholder scan:** No TBD/placeholder steps. Task 7 is intentionally gated and self-contained, with concrete prompts, exact output paths, and a stated fallback. The "build is red between Task 1 and Task 5" window is documented with explicit per-task run commands (vitest only until Task 5).

**Type consistency:** The `Transformation` interface (`{ name, weeks, beforeSrc, afterSrc, stat }`) defined in Task 1 is consumed by `TransformationsGallery` (Task 2), the building screen (Task 5), and the landing page (Task 6) with matching field names. `useCheckout(answers)` returning `{ start, pending, error, ready }` (Task 3) is consumed by `CheckoutButton` (Task 3), `ReportCard` via `CheckoutButton` (Task 4), and `ResultStickyBar` (Task 4) consistently. `ReportCard` props change to `{ result, answers }` and `ResultStickyBar` to `{ recoverableYears, answers }`, matched by the `app/scan/page.tsx` update (Task 4). Image paths in `testimonials.ts` (Task 1) exactly match the files generated in Task 7. No drift found.
