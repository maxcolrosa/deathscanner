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

**The product is a real, per-user guide + asset kit, generated deterministically server-side (no AI call).** Clicking buy calls the `startGuideGeneration(answers)` server action (`lib/guide/start.ts`), which stores an order (`lib/guide/orders.ts`: Supabase when `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set, else an in-process store for dev/tests) and routes to `/guide/[token]`. The guide is built by `lib/guide/build-guide.ts`, a deterministic offline engine that branches on the answers (training level, past injury, diet, goal, sleep/stress, barrier) into the rich `GuideDoc` shape (`lib/guide/schema.ts`). Beyond the 8-week plan it derives a personalized **`yourNumbers`** dashboard (estimated starting bands + goal targets + an 8-week milestone map, framed as estimates/goals, never as measured biometrics), four **`bonusModules`** (Plateau Protocol, Travel kit, Supplement Truth, Your Next 8 Weeks — each a `DeepDive`), and **`trackers`** data (aisle-grouped grocery list + daily checklist). It runs on the first status poll (`app/api/guide/[token]/status`), so it never waits on background timing; `/guide/[token]` shows a polling "building" screen then the guide (`components/guide/guide-view.tsx`), whose top "kit" block offers three downloads. `startGuideGeneration`/`generateGuide` are the seam a future Stripe webhook reuses; there is no real payment yet. `lib/product.ts` is the single source for product name, copy, prices ($9 live / $19 after the countdown / $79 list anchor), and the `INCLUDED[]` value stack (sum of item `value`s must equal `PRODUCT.stackValue`, currently 383 — locked by `lib/product.test.ts`). Every `INCLUDED` line must map to something actually delivered: do not re-add a "community" or coaching promise (there is none).

**The downloadable kit is three `@react-pdf/renderer` documents, served by one route.** `app/guide/[token]/download/[asset]/route.ts` maps `asset` in `{ workbook | trackers | quickstart }` to a Document and filename (`renderToBuffer`, nodejs runtime); an unknown token/asset 404s, a not-ready order redirects to `/guide/[token]` (the building screen). The legacy `app/guide/[token]/pdf` route redirects to `/download/workbook`. The documents: `components/guide/guide-pdf.tsx` (the full **workbook**: cover, table of contents, all guide sections, the `yourNumbers` and bonus pages, and printable tracker grids), `components/guide/tracker-pack-pdf.tsx` (the printable trackers alone), and `components/guide/quickstart-pdf.tsx` (a one-page start-today summary). Shared font registration, the monitor palette `C`, and the five tracker render components live in `components/guide/pdf-shared.tsx` and are imported by both the workbook and the tracker pack (do not duplicate them). **No `fixed` running header/footer in ANY of these documents**: react-pdf 4.x miscomputes layout for any `fixed` element across the many auto-broken pages and throws `unsupported number`, which would 500 the download route. Consequently the table of contents lists sections with no page numbers, and grids are plain flex `View`s (use `wrap={false}` only on small atomic blocks, never a whole grid). `lib/guide/pdf-render.test.ts` is the regression guard: it `renderToBuffer`s all three documents for sample guides and asserts a non-empty buffer. Verify any PDF change by running it.

**Social proof is fixed and shared.** Reviews (`components/reviews.tsx`, with a per-review star rating, verified-buyer badge, and an aggregate score) and at-home before/after transformation images (`components/transformations-gallery.tsx`) render on the result page (inside `GuidePitch`) and the building screen, never on the landing page. Both read from `lib/guide/testimonials.ts`: `TESTIMONIALS` carry `quote`/`name`/`meta`/`detail`/`rating`/`verifiedAgo`, and `TRANSFORMATIONS` reference the images (the `weeks`/`stat` timeframe fields were removed). The files in `public/transformations/` (generated with the Higgsfield CLI) are **static-imported** in `testimonials.ts`, not string paths, so Next fingerprints them by content hash and replacing a file busts the optimizer + browser cache automatically. Do not revert to `/transformations/x.jpg` strings, or swapped photos render stale. **Do not add result-speed timeframes** (e.g. "down 8 kg in 8 weeks", "by week three") to review copy, transformation cards, or the guide's results FAQ — they were deliberately stripped as unrealistic. Each of reviews and transformations carries a small asterisk "illustrative / AI-generated / results vary, not typical" disclaimer linking to `/terms`; the full disclosure lives in `/terms`.

**Legal pages carry the disclosure and the company identity.** `/privacy`, `/terms`, `/cookies` (under `app/`, rendered via `components/legal-page.tsx`) are linked from `components/site-footer.tsx`. The site and product are operated by **ColrosaStudios LTD** (registered in England and Wales; governing law England and Wales), named across all three legal pages and the footer. `app/terms/page.tsx` carries full coverage: the parody / "not a real AI or medical estimate / it is marketing for the real guide" disclosure (this belongs ONLY in the legal pages, never the product UI), plus health/fitness + assumption-of-risk, 18+, no-warranty, limitation of liability (capped at amount paid), the UK statutory-rights carve-out (death/personal-injury by negligence, fraud, consumer rights unaffected — this is what keeps the liability limits lawful), indemnity, and a Consumer Contracts Regulations 2013 digital-cancellation waiver. `app/privacy/page.tsx` is UK GDPR / DPA 2018 aware (data-subject rights + the ICO). **No contact emails exist yet**: the pages use clearly-bracketed `[company number to be added]` / `[registered office address to be added]` placeholders and say a support contact will be published — do not invent a company number, address, or email.

## Specs and plans

Design specs and the implementation plan live in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Read the relevant spec before large changes; it captures decisions (the dark-monitor direction, the deterministic-engine choice, the funnel structure) that are not obvious from the code alone.

@AGENTS.md
