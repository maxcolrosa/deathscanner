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

**`app/scan/page.tsx` is the client state machine** for the whole experience: `quiz -> analyzing -> result`. The quiz is dynamic — it tracks the current question by id and recomputes the active list from `getActiveQuestions(answers)` each render, so branching follow-ups appear/disappear live. The result phase wraps everything in `SaleProvider` and renders `ReportCard` + `GuidePitch` + `ResultStickyBar`.

**Pricing/urgency is a React context, `components/sale-context.tsx`.** `SaleProvider` mounts on the result page, so the countdown starts on landing. The deadline is held in memory and **not persisted**, so a refresh or a fresh scan resets it. When the timer hits zero the price rises (`PRODUCT.price` -> `PRODUCT.expiredPrice`). Every price/timer display (`ReportCard` first CTA, `ResultStickyBar`, `GuidePitch` price block, `CheckoutButton`) reads `useSale()` — never hardcode the price.

**The report (`components/report-card.tsx`) is synthesized, not a data dump:** a narrative plus the top risk drivers with qualitative impact tags and one-line clinical reasons, no per-factor year numbers. Its primary CTA is intentionally above the fold.

**Checkout is a deliberate placeholder.** `components/checkout-button.tsx` is the single file to change to wire up Stripe (a Checkout Session or Payment Link). `lib/product.ts` is the single source for product name, copy, prices, and the value-stack items.

**Legal pages carry the disclosure.** `/privacy`, `/terms`, `/cookies` (under `app/`, rendered via `components/legal-page.tsx`) are linked from `components/site-footer.tsx`. The parody / "not a real AI or medical estimate / it is marketing for the real guide" disclosure belongs in `app/terms/page.tsx`, not in the product UI.

## Specs and plans

Design specs and the implementation plan live in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Read the relevant spec before large changes; it captures decisions (the dark-monitor direction, the deterministic-engine choice, the funnel structure) that are not obvious from the code alone.

@AGENTS.md
