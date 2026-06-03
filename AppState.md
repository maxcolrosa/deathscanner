# AppState.md

Working handoff doc for The Longevity Scan. Pair with `CLAUDE.md` (architecture) and the specs/plans in `docs/superpowers/`.

Last updated: 2026-06-03.

---

## 1. Current state (what exists today)

A working parody funnel with a **real, generated product** behind it. End to end:

**Quiz -> fake AI analysis -> death-date report (with offer) -> generated guide + PDF.**

- Deterministic "model" in `lib/longevity.ts` (no real AI, no network) produces the death estimate and the report inputs.
- Clicking buy on the report runs `startGuideGeneration(answers)` (`lib/guide/start.ts`), which stores an **order** and routes to `/guide/[token]`: a polling "building" screen, then the rendered guide (`components/guide/guide-view.tsx`) and a downloadable PDF (`app/guide/[token]/pdf`).
- The guide is built by `lib/guide/build-guide.ts`: a **deterministic, offline engine, no AI call**. It branches on the user's answers (training level, past injury, diet, goal, sleep/stress, training barrier, body composition) into the rich `GuideDoc` shape (`lib/guide/schema.ts`). Instant and free per guide; it runs on the first status poll (`app/api/guide/[token]/status`) so it never depends on background timing.
- Orders persist in **Supabase** when `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set, else an in-process store for dev/tests (`lib/guide/orders.ts`). The `orders` table migration is `supabase/migrations/20260603120000_orders.sql` (already applied to the live project).
- Result page: above-the-fold offer with a one-click CTA that starts checkout directly (no scroll jump). Social proof (reviews + at-home before/after transformation images) shows on the result page and the building screen, not the landing page.
- Dark "diagnostic monitor" theme; in-memory per-user sale countdown that raises the price on expiry (`components/sale-context.tsx`).
- Legal pages (`/privacy`, `/terms`, `/cookies`) carry the parody disclosure and the "reviews/images are illustrative / AI-generated" disclosure.

**Repo / infra:**
- GitHub: `github.com/maxcolrosa/deathscanner`, branch `main` (Phase B and Phase C merged and pushed).
- Supabase project `xhovvuuamwuwvbvibiau` (orders table live). Secrets are in `.env.local` (gitignored).
- Higgsfield CLI (`higgsfield` / `higgs`) is installed and authenticated; used at build time to generate the transformation images in `public/transformations/`.

**Quality:** 46 unit tests (`lib/**/*.test.ts`), Playwright smoke (full scan + purchase -> guide -> PDF), clean `tsc`/`lint`/`build`.

Tech: Next.js 16 (App Router) / React 19 / TS / Tailwind v4 / Motion / Geist / shadcn-on-`@base-ui`. See `CLAUDE.md` for stack gotchas (base-ui `Button` has no `asChild`; `RadioGroup` uses `onValueChange`/`data-checked`; zero em-dashes in UI copy; Next 16 docs in `node_modules/next/dist/docs/`).

---

## 2. What does NOT exist yet (the next phase)

**Real payment.** Clicking buy starts guide generation directly; no money changes hands. `startGuideGeneration`/`generateGuide` are the clean seam: a Stripe Checkout Session + a `checkout.session.completed` webhook should create the order / trigger generation instead of the button. Pass the **current** price from `useSale()` but validate it server-side. The `stripe` plugin/skills are available. See `docs/superpowers/specs/2026-06-03-phase-b-generated-guide-design.md` (section "Phase C - Stripe") for the original plan.

Also not present: auth (access is via the unguessable token URL), email delivery, analytics.

**Brand rename pending.** The app is still named "Longevity Scan" everywhere (including the PDF `BRAND` const); the user is choosing a replacement. Shortlist + available domains are in Claude memory `brand-name-candidates` (Reckon / Mortalis / Span / Hundo, all with free `.co` domains). When chosen, rename across `app/layout.tsx`, `app/page.tsx`, `components/site-footer.tsx`, `components/legal-page.tsx`, the `/privacy` `/terms` `/cookies` titles and `@longevityscan.example` contact emails, and `BRAND` in `components/guide/guide-pdf.tsx`. The product name (`PRODUCT.name`, "The Second Wind Protocol") is separate.

---

## 3. Key integration points

- **Checkout seam:** `lib/guide/start.ts` (`startGuideGeneration`) and `lib/guide/generate.ts` (`generateGuide`). Wire Stripe here.
- **Guide content:** `lib/guide/build-guide.ts` (deterministic engine) + `lib/guide/schema.ts` (`GuideDoc`). To change the guide, edit these; covered by `lib/guide/build-guide.test.ts`.
- **Order storage:** `lib/guide/orders.ts` (Supabase + in-memory backends) and `lib/supabase/server.ts` (service-role client, server-only).
- **Price/timer source of truth:** `components/sale-context.tsx` (`useSale()`); `lib/product.ts` holds price (9), expiredPrice (19), listPrice (79), stackValue (294), and `INCLUDED[]`. Never hardcode price in UI.
- **Social proof data:** `lib/guide/testimonials.ts` (`TESTIMONIALS` with `quote`/`name`/`meta`/`detail`/`rating`/`verifiedAgo`; `TRANSFORMATIONS`). Transformation images in `public/transformations/` are **static-imported** in `testimonials.ts` (content-hash fingerprinting busts caches on file swap) - do not switch back to string paths. Reviews UI (`components/reviews.tsx`) shows stars, verified-buyer badges, and an aggregate score.
- **Downloadable PDF:** `components/guide/guide-pdf.tsx` (`@react-pdf/renderer`, dark monitor theme, Geist fonts). Must stay free of `fixed` running headers/footers - react-pdf 4.x crashes with "unsupported number" across the guide's many pages and would 500 the PDF route.

---

## 4. Environment variables

`.env.local` (gitignored) currently holds:

```
SUPABASE_URL=...                    # live, orders table applied
SUPABASE_SERVICE_ROLE_KEY=...       # server-only
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # not used by current server-only code
ANTHROPIC_API_KEY=...               # NO LONGER USED (guide is deterministic); safe to remove
GUIDE_STUB=                         # legacy flag, no longer read; safe to remove
```

For Stripe later: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, optionally `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

Note: the secrets were pasted into a chat transcript during setup; consider rotating the Supabase service-role key.

---

## 5. Harmless leftovers that can be cleaned up

- `@anthropic-ai/sdk` dependency (unused now that the guide is deterministic).
- `ANTHROPIC_API_KEY` in `.env.local` and the `GUIDE_STUB` env in `playwright.config.ts` (no longer read).

---

## 6. Constraints that carry into new work

- Keep `computeResult` (and `buildGuide`) deterministic; only cosmetic surfaces (the analyzing log, the building-screen rotating status) may use time/randomness.
- UI/copy: no em-dashes; run UI through the `design-taste-frontend-v1` skill; stay in the locked dark-monitor theme and `monitor-*` tokens.
- The parody / AI-content disclosures stay in the legal pages; product surfaces read as credible.
- shadcn here is base-ui: no `asChild` on `Button`; `RadioGroup` uses `onValueChange`/`data-checked`.
- Verification loop before shipping: `npm test && npx tsc --noEmit && npm run lint && npm run build`, then `npm run e2e`.
- Production note: the in-memory order store does not work across serverless instances; Supabase must be configured in production.
