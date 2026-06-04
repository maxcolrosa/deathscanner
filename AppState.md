# AppState.md

Working handoff doc for The Longevity Scan. Pair with `CLAUDE.md` (architecture) and the specs/plans in `docs/superpowers/`.

Last updated: 2026-06-04.

---

## 1. Current state (what exists today)

A working parody funnel with a **real, generated product** behind it. End to end:

**Quiz -> fake AI analysis -> death-date report (with offer) -> generated guide + PDF.**

- Deterministic "model" in `lib/longevity.ts` (no real AI, no network) produces the death estimate and the report inputs.
- Clicking buy on the report runs `startGuideGeneration(answers)` (`lib/guide/start.ts`), which stores an **order** and routes to `/guide/[token]`: a polling "building" screen, then the rendered guide (`components/guide/guide-view.tsx`) and a **downloadable 3-PDF kit** (workbook / tracker pack / quick-start) served from `app/guide/[token]/download/[asset]/route.ts` (`/guide/[token]/pdf` redirects to `/download/workbook`).
- The guide is built by `lib/guide/build-guide.ts`: a **deterministic, offline engine, no AI call**. It branches on the user's answers (training level, past injury, diet, goal, sleep/stress, training barrier, body composition) into the rich `GuideDoc` shape (`lib/guide/schema.ts`). Beyond the 8-week plan it produces a personalized **`yourNumbers`** dashboard (estimated bands + goal targets + an 8-week milestone map), four **`bonusModules`** (plateaus, travel, supplements, next 8 weeks), and **`trackers`** data (aisle grocery list + daily checklist). Instant and free per guide; it runs on the first status poll (`app/api/guide/[token]/status`) so it never depends on background timing.
- The kit is three `@react-pdf/renderer` documents: `guide-pdf.tsx` (the full **workbook**: cover, TOC, all sections, dashboard, bonus pages, printable tracker grids), `tracker-pack-pdf.tsx`, and `quickstart-pdf.tsx`, with shared fonts/palette/tracker components in `pdf-shared.tsx`. None may use `fixed` elements (react-pdf 4.x crashes); `lib/guide/pdf-render.test.ts` renders all three to a buffer as the guard.
- Orders persist in **Supabase** when `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set, else an in-process store for dev/tests (`lib/guide/orders.ts`). The `orders` table migration is `supabase/migrations/20260603120000_orders.sql` (already applied to the live project).
- Result page: above-the-fold offer with a one-click CTA that starts checkout directly (no scroll jump). Social proof (reviews + at-home before/after transformation images) shows on the result page and the building screen, not the landing page.
- Dark "diagnostic monitor" theme; in-memory per-user sale countdown that raises the price on expiry (`components/sale-context.tsx`).
- Legal pages (`/privacy`, `/terms`, `/cookies`) carry full coverage under **ColrosaStudios LTD** (England and Wales; parody disclosure, health/18+/no-warranty, liability cap, UK statutory-rights carve-out, Consumer Contracts digital-cancellation waiver, UK GDPR + ICO). Operator named across legal pages + footer. **No contact emails yet** - bracketed `[company number to be added]` / `[registered office address to be added]` placeholders and a "support contact coming" note. Reviews + transformations each carry a small results/illustrative asterisk disclaimer linking to `/terms`; transformation/result-speed timeframes were removed as unrealistic.

**Repo / infra:**
- GitHub: `github.com/maxcolrosa/deathscanner`, branch `main` (Phase B and Phase C merged and pushed).
- Supabase project `xhovvuuamwuwvbvibiau` (orders table live). Secrets are in `.env.local` (gitignored).
- Higgsfield CLI (`higgsfield` / `higgs`) is installed and authenticated; used at build time to generate the transformation images in `public/transformations/`.

**Quality:** 60 unit tests (`lib/**/*.test.ts`, incl. the PDF render smoke tests), Playwright smoke (full scan + purchase -> guide, exercising all three download PDF routes), clean `tsc`/`lint`/`build`.

Tech: Next.js 16 (App Router) / React 19 / TS / Tailwind v4 / Motion / Geist / shadcn-on-`@base-ui`. See `CLAUDE.md` for stack gotchas (base-ui `Button` has no `asChild`; `RadioGroup` uses `onValueChange`/`data-checked`; zero em-dashes in UI copy; Next 16 docs in `node_modules/next/dist/docs/`).

---

## 2. What does NOT exist yet (the next phase)

**Real payment.** Clicking buy starts guide generation directly; no money changes hands. `startGuideGeneration`/`generateGuide` are the clean seam: a Stripe Checkout Session + a `checkout.session.completed` webhook should create the order / trigger generation instead of the button. Pass the **current** price from `useSale()` but validate it server-side. The `stripe` plugin/skills are available. See `docs/superpowers/specs/2026-06-03-phase-b-generated-guide-design.md` (section "Phase C - Stripe") for the original plan.

Also not present: auth (access is via the unguessable token URL), email delivery, analytics.

**Brand rename pending.** The app is still named "Longevity Scan" everywhere; the user is choosing a replacement. Shortlist + available domains are in Claude memory `brand-name-candidates` (Reckon / Mortalis / Span / Hundo, all with free `.co` domains). When chosen, rename across `app/layout.tsx` (note: its `<title>` still has the old name AND an em-dash, which violates the no-em-dash UI rule, fix on rename), `app/page.tsx`, `components/site-footer.tsx`, `components/legal-page.tsx`, the `/privacy` `/terms` `/cookies` `metadata.title`s, and the `BRAND` const which is now **duplicated in all three PDF documents** (`components/guide/guide-pdf.tsx`, `tracker-pack-pdf.tsx`, `quickstart-pdf.tsx` - ideally hoist it into `components/guide/pdf-shared.tsx` at the same time). The legal-page contact emails were **removed** (no more `@longevityscan.example`); the company is **ColrosaStudios LTD**, so the rename concerns the consumer brand only. The product name (`PRODUCT.name`, "The Second Wind Protocol") is separate.

**Company + support details pending.** Legal pages name ColrosaStudios LTD but use bracketed `[company number to be added]` / `[registered office address to be added]` placeholders and have no support email yet. Fill these in once the company is registered and a support inbox exists. A solicitor review of `app/terms/page.tsx` before going live is advisable.

---

## 3. Key integration points

- **Checkout seam:** `lib/guide/start.ts` (`startGuideGeneration`) and `lib/guide/generate.ts` (`generateGuide`). Wire Stripe here.
- **Guide content:** `lib/guide/build-guide.ts` (deterministic engine) + `lib/guide/schema.ts` (`GuideDoc`). To change the guide, edit these; covered by `lib/guide/build-guide.test.ts`.
- **Order storage:** `lib/guide/orders.ts` (Supabase + in-memory backends) and `lib/supabase/server.ts` (service-role client, server-only).
- **Price/timer source of truth:** `components/sale-context.tsx` (`useSale()`); `lib/product.ts` holds price (9), expiredPrice (19), listPrice (79), stackValue (383), and `INCLUDED[]` (7 items, each mapping to delivered content; no community/coaching promise). `lib/product.test.ts` locks `sum(INCLUDED.value) === stackValue`. Never hardcode price in UI.
- **Guide content:** `lib/guide/build-guide.ts` + `lib/guide/schema.ts` (`GuideDoc`, now incl. `yourNumbers`/`bonusModules`/`trackers`). Deterministic; covered by `lib/guide/build-guide.test.ts`. To change what the buyer gets, edit here.
- **Social proof data:** `lib/guide/testimonials.ts` (`TESTIMONIALS` with `quote`/`name`/`meta`/`detail`/`rating`/`verifiedAgo`; `TRANSFORMATIONS`, with the `weeks`/`stat` timeframe fields removed). Transformation images in `public/transformations/` are **static-imported** in `testimonials.ts` (content-hash fingerprinting busts caches on file swap) - do not switch back to string paths. Reviews UI (`components/reviews.tsx`) shows stars, verified-buyer badges, and an aggregate score; both reviews and transformations carry an asterisk results disclaimer linking to `/terms`. Do not add result-speed timeframes back to any social-proof or guide copy.
- **Downloadable kit (3 PDFs, 1 route):** `app/guide/[token]/download/[asset]/route.ts` serves `workbook | trackers | quickstart` via `renderToBuffer`; `/guide/[token]/pdf` redirects to `/download/workbook`. Documents: `components/guide/guide-pdf.tsx` (workbook), `tracker-pack-pdf.tsx`, `quickstart-pdf.tsx`, sharing `components/guide/pdf-shared.tsx` (fonts, palette `C`, tracker components). All must stay free of `fixed` running headers/footers - react-pdf 4.x crashes with "unsupported number" across the many pages and would 500 the route. `lib/guide/pdf-render.test.ts` is the guard.

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
