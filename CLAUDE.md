# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A parody web app: an "AI longevity scan" that runs a mock-clinical lifestyle quiz, fakes an AI analysis, reveals a predicted date of death, and funnels the user into buying a (real) fitness guide. The death estimate is fictional; it exists as marketing. This framing matters: the experience is deliberately deadpan-credible, and the "this is a parody" disclosure lives only in the legal pages, never in the main UI.

## Commands

```bash
npm run dev        # local dev server at http://localhost:3000
npm run build      # production build (also runs tsc + eslint)
npm run lint       # eslint
npm test           # vitest run (engine unit tests in lib/*.test.ts)
npm run test:watch # vitest watch
npm run e2e        # Playwright smoke test (drives the full scan flow; reuses a running dev server)
```

Run a single engine test:
```bash
npx vitest run lib/longevity.test.ts -t "best-case answers push life expectancy up"
```

After UI or copy changes, the verification loop that has caught real issues is: `npm test && npx tsc --noEmit && npm run lint && npm run build`, then `npm run e2e`.

## Stack and non-obvious constraints

- **Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Motion (`motion/react`), Geist fonts.** Next 16 has breaking changes vs. older training data — see `AGENTS.md` / `node_modules/next/dist/docs/` before writing Next-specific code.
- **shadcn/ui here is built on `@base-ui/react`, not Radix.** Consequences that bite:
  - `Button` has no `asChild`. To render a link as a button, use `buttonVariants()` + `cn()` on a `<Link>` (see `app/page.tsx`).
  - `RadioGroup` uses `onValueChange` (not `onChange`) and marks selection with a `data-checked` attribute (selected-state styling keys off `has-[data-checked]`, see `components/quiz-step.tsx`).
- **No em-dashes (`—` or `–`) in any user-facing string.** This is enforced; use hyphens, commas, or periods. UI work is expected to go through the `design-taste-frontend` skill (per the user's global config).
- **Theme is a single locked dark "diagnostic monitor" mode.** Color tokens are defined in `app/globals.css` via Tailwind v4 `@theme` as `--color-monitor-*` (utilities like `bg-monitor-panel`, `text-monitor-accent`). One brand accent (teal `monitor-accent`); red (`monitor-alert`) is reserved for mortality/risk data only. shadcn semantic tokens (`--color-primary`, etc.) are mapped to the monitor palette in the same file, so do not delete them.

## Architecture (the parts that span multiple files)

**`lib/longevity.ts` is the single source of truth and the only place real logic lives.** It is a pure, deterministic, offline "model" (no network, no AI call). `computeResult(answers, today?)` returns the full `ScanResult`; `today` is injectable so tests are deterministic. Key behaviors that everything downstream depends on:
- `QUESTIONS` drives the quiz. Questions can branch (`showIf(answers)`) and can be collected-but-not-scored (`scored: false`, e.g. the goal question). `getActiveQuestions(answers)` returns the visible, ordered list.
- The estimate uses decimal, epidemiology-flavored weights, and negative factors run through a diminishing-returns curve (`NEG_CAP`, `NEG_SCALE`) so a worst-case profile bottoms out believably instead of free-falling. **Keep the estimate deterministic for a given set of answers** — only cosmetic things (the analysis log) may use randomness.
- It also derives the report and funnel inputs: `topRisks`/`strengths` (for the report), `recoverableYears` (measured as the dampened gain from neutralizing modifiable risks), results-based `outcomes` (goal-aligned), a per-user `modelConfidence`, and `analysisSignals(answers)` (answer-specific phrases for the analyzing screen). It is covered by `lib/longevity.test.ts`.

**`app/scan/page.tsx` is the client state machine** for the whole experience: `quiz -> analyzing -> result`. The quiz is dynamic — it tracks the current question by id and recomputes the active list from `getActiveQuestions(answers)` each render, so branching follow-ups appear/disappear live. The result phase wraps everything in `SaleProvider` and renders `ReportCard` + `GuidePitch` + `ResultStickyBar`; the result-page CTAs start guide generation directly (no smooth-scroll jump) via the shared `components/use-checkout.ts` hook, threading `answers` down to `CheckoutButton`/`ReportCard`/`ResultStickyBar`.

**Pricing/urgency is a React context, `components/sale-context.tsx`.** `SaleProvider` mounts on the result page, so the countdown starts on landing. The deadline is held in memory and **not persisted**, so a refresh or a fresh scan resets it. When the timer hits zero the price rises (`PRODUCT.price` -> `PRODUCT.expiredPrice`). Every price/timer display (`ReportCard` first CTA, `ResultStickyBar`, `GuidePitch` price block, `CheckoutButton`) reads `useSale()` — never hardcode the price.

**The report (`components/report-card.tsx`) is synthesized, not a data dump:** a narrative plus the top risk drivers with qualitative impact tags and one-line clinical reasons, no per-factor year numbers. Its offer block and primary CTA sit above the fold, and the CTA starts checkout directly.

**The product is a real, per-user guide, generated deterministically server-side (no AI call).** Clicking buy calls the `startGuideGeneration(answers)` server action (`lib/guide/start.ts`), which stores an order (`lib/guide/orders.ts`: Supabase when `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set, else an in-process store for dev/tests) and routes to `/guide/[token]`. The guide is built by `lib/guide/build-guide.ts`, a deterministic offline engine that branches on the answers (training level, past injury, diet, goal, sleep/stress, barrier) into the `GuideDoc` shape (`lib/guide/schema.ts`). It runs on the first status poll (`app/api/guide/[token]/status`), so it never waits on background timing; `/guide/[token]` shows a polling "building" screen then the guide (`components/guide/guide-view.tsx`) plus a downloadable PDF (`app/guide/[token]/pdf`, rendered by `components/guide/guide-pdf.tsx`). `startGuideGeneration`/`generateGuide` are the seam a future Stripe webhook reuses; there is no real payment yet. `lib/product.ts` is the single source for product name, copy, prices ($9 live / $19 after the countdown / $79 list anchor), and value-stack items.

**The PDF (`components/guide/guide-pdf.tsx`) is a `@react-pdf/renderer` document matched to the dark monitor theme** (monitor palette, real Geist + Geist Mono registered via `Font.register` from `node_modules/geist/dist/fonts`, with a Helvetica/Courier fallback if the TTFs are missing). It is deliberately built with **no `fixed` running header/footer**: react-pdf 4.x miscomputes layout for any `fixed` element across this guide's ~25+ auto-broken pages and throws `unsupported number`, which would 500 the `/guide/[token]/pdf` route. Page identity lives on the cover instead, and a code comment guards against re-adding fixed elements. Verify changes by building a guide and rendering it to a buffer (the route uses `renderToBuffer`).

**Social proof is fixed and shared.** Reviews (`components/reviews.tsx`, with a per-review star rating, verified-buyer badge, and an aggregate score) and at-home before/after transformation images (`components/transformations-gallery.tsx`) render on the result page (inside `GuidePitch`) and the building screen, never on the landing page. Both read from `lib/guide/testimonials.ts`: `TESTIMONIALS` carry `quote`/`name`/`meta`/`detail`/`rating`/`verifiedAgo`, and `TRANSFORMATIONS` reference the images. The files in `public/transformations/` (generated with the Higgsfield CLI) are **static-imported** in `testimonials.ts`, not string paths, so Next fingerprints them by content hash and replacing a file busts the optimizer + browser cache automatically. Do not revert to `/transformations/x.jpg` strings, or swapped photos render stale. Their "illustrative / AI-generated" disclosure lives in `/terms`.

**Legal pages carry the disclosure.** `/privacy`, `/terms`, `/cookies` (under `app/`, rendered via `components/legal-page.tsx`) are linked from `components/site-footer.tsx`. The parody / "not a real AI or medical estimate / it is marketing for the real guide" disclosure belongs in `app/terms/page.tsx`, not in the product UI.

## Specs and plans

Design specs and the implementation plan live in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Read the relevant spec before large changes; it captures decisions (the dark-monitor direction, the deterministic-engine choice, the funnel structure) that are not obvious from the code alone.

@AGENTS.md
