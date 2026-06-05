# AppState.md

Working handoff doc for The Longevity Scan. Pair with `CLAUDE.md` (architecture) and the specs/plans in `docs/superpowers/`.

Last updated: 2026-06-04.

---

## 1. Current state (what exists today)

A working parody funnel with a **real, generated product** behind it. End to end:

**Quiz -> fake AI analysis -> death-date report (with offer) -> generated guide + PDF.**

- Deterministic "model" in `lib/longevity.ts` (no real AI, no network) produces the death estimate and the report inputs.
- Clicking buy on the report runs `beginCheckout(answers, { expired, currency })` (`lib/guide/checkout.ts`): with Stripe configured it redirects to hosted Stripe Checkout (order `awaiting_payment`), else it falls back to `startGuideGeneration(answers)` (`lib/guide/start.ts`, direct generate). A paid order is fulfilled idempotently (webhook `app/api/stripe/webhook/route.ts` + success-page `?session_id=` fallback, both via `lib/guide/fulfill.ts`, which emails the link through Resend) and routes to `/guide/[token]`: a polling "building" screen, then the rendered guide (`components/guide/guide-view.tsx`) and a **downloadable 5-PDF kit** (workbook / recipe book / exercise library / tracker pack / quick-start) served from `app/guide/[token]/download/[asset]/route.ts` (`/guide/[token]/pdf` redirects to `/download/workbook`).
- The guide is built by `lib/guide/build-guide.ts`: a **deterministic, offline engine, no AI call**. It branches on the user's answers (training level, past injury, diet, goal, sleep/stress, training barrier, body composition) into the rich `GuideDoc` shape (`lib/guide/schema.ts`). It is a comprehensive **90-day program**: the week-by-week schedule (`weeks`, 8 entries) is the detailed first 8 weeks, and `programArc` is the full 90-day roadmap + monthly reviews. Alongside it: a personalized **`yourNumbers`** dashboard (estimated bands + goal targets + 90-day milestones), four **`bonusModules`** (plateaus, travel, supplements, life after your 90 days), **`trackers`** (aisle grocery list + daily checklist), a **`recipeBank`** (`lib/guide/recipes.ts`, goal/diet-selected recipes + macros + shopping list), an **`exerciseLibrary`** (`lib/guide/exercises.ts`, full form/cues for every prescribed movement), and **`scienceNotes`** (`lib/guide/science.ts`, real references only, no fabricated citations). Instant and free per guide; it runs on the first status poll (`app/api/guide/[token]/status`) so it never depends on background timing.
- The kit is five `@react-pdf/renderer` documents: `guide-pdf.tsx` (the full **workbook**: cover, TOC, all sections incl. 90-day arc/science/recipes/exercises, dashboard, bonus pages, tracker grids), `tracker-pack-pdf.tsx` (incl. the 12-week measurement grid), `quickstart-pdf.tsx`, `recipe-book-pdf.tsx`, and `exercise-library-pdf.tsx`, with shared fonts/palette/tracker+content components and `coverStyles` in `pdf-shared.tsx`. None may use `fixed` elements (react-pdf 4.x crashes); `lib/guide/pdf-render.test.ts` renders all five to a buffer as the guard.
- Orders persist in **Supabase** when `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set, else an in-process store for dev/tests (`lib/guide/orders.ts`). The `orders` table migration is `supabase/migrations/20260603120000_orders.sql` (already applied to the live project).
- Landing (`app/page.tsx`) and result pages are a conversion funnel with truthful price psychology: asymmetric hero + how-it-works stepper + locked/redacted result panel + loss-framed stakes + FAQ on the landing; the result page leads with the death-date reveal then a lean first-ask (`ReportCard`), and `GuidePitch` runs promise -> value stack -> proof -> one dominant `OfferModule` (deal anchor $492/$129/$13 + live countdown + price-jump warning + loss framing) -> close. Social proof (reviews + transformations) shows on the result page and building screen, not the landing.
- Dark "diagnostic monitor" theme; the sale countdown is **persisted per visitor in `localStorage`** (`components/sale-context.tsx`), so it does not reset on refresh and the price genuinely stays at $24 once it expires (honest urgency, no fabricated scarcity). `useSale()` exposes `remaining`/`expired`/`price`/`expiredPrice`/`listPrice`.
- Legal pages (`/privacy`, `/terms`, `/cookies`) carry full coverage under **ColrosaStudios LTD** (England and Wales; parody disclosure, health/18+/no-warranty, liability cap, UK statutory-rights carve-out, Consumer Contracts digital-cancellation waiver, UK GDPR + ICO). Operator named across legal pages + footer. **No contact emails yet** - bracketed `[company number to be added]` / `[registered office address to be added]` placeholders and a "support contact coming" note. Reviews + transformations each carry a small results/illustrative asterisk disclaimer linking to `/terms`; transformation/result-speed timeframes were removed as unrealistic.

**Repo / infra:**
- GitHub: `github.com/maxcolrosa/deathscanner`, branch `main` (Phase B and Phase C merged and pushed).
- Supabase project `xhovvuuamwuwvbvibiau` (orders table live). Secrets are in `.env.local` (gitignored).
- Higgsfield CLI (`higgsfield` / `higgs`) is installed and authenticated; used at build time to generate the transformation images in `public/transformations/`.

**Quality:** 85 unit tests (`lib/**/*.test.ts`, incl. the PDF render smoke tests across all five documents), Playwright smoke (full scan + purchase -> guide, exercising all five download PDF routes), clean `tsc`/`lint`/`build`.

Tech: Next.js 16 (App Router) / React 19 / TS / Tailwind v4 / Motion / Geist / shadcn-on-`@base-ui`. See `CLAUDE.md` for stack gotchas (base-ui `Button` has no `asChild`; `RadioGroup` uses `onValueChange`/`data-checked`; zero em-dashes in UI copy; Next 16 docs in `node_modules/next/dist/docs/`).

---

## 2. What does NOT exist yet (the next phase)

**Payment + email list + drip are DONE (test mode / no-op email).** Stripe hosted Checkout (`beginCheckout` in `lib/guide/checkout.ts`) creates an `awaiting_payment` order + session; the webhook (`app/api/stripe/webhook/route.ts`) and a success-page `?session_id=` fallback both call `fulfillPaidOrder` (`lib/guide/fulfill.ts`) -> `markPaid` (idempotent) -> Resend email. An email wall (`components/email-gate.tsx`, the `capture` phase) collects the email + opt-in consent and a personalized report email goes out (`emails/report-email.tsx`). Consented leads enter a 3-email drip (report, +1d value, +2d win-back) via `lib/marketing/email-jobs.ts` + the `app/api/cron/email-drip` Vercel Cron (`lib/marketing/drip.ts`), with a signed win-back link (`lib/marketing/winback.ts`) to `app/api/winback/[token]` that checks out at `winbackPrice`. Verified live against the test key: USD 1300, GBP 1100, win-back 900.

**OPEN ITEMS before production / before Resend goes live:**
- Apply the three new migrations to the live Supabase project: `20260605130000_orders_payment.sql` (adds `awaiting_payment` + payment columns), `20260605140000_subscribers.sql`, `20260605150000_email_jobs.sql`. Until applied, real Stripe + Supabase together 500 on the orders status-check constraint; dev/e2e use the in-memory store and are fine.
- `captureLead` is a public endpoint that sends email. It already bounds input, best-effort per-IP rate-limits, and sends the report only on first capture. Before turning on Resend, add: a CAPTCHA/Turnstile check, a durable shared-store rate limit (the current one is in-memory, not serverless-durable), and consider double opt-in for marketing consent + a consent audit trail.
- Email is WIRED and verified end-to-end: `RESEND_API_KEY` + `EMAIL_FROM=onboarding@resend.dev` are set in `.env.local`, and all four templates (report, guide-ready, value, win-back) were sent live through the app's Resend path. NOTE: the `onboarding@resend.dev` sandbox sender only delivers to the Resend account owner's own address (`max.dennis@colrosastudios.com`); to email real users, verify a domain at resend.com/domains and change `EMAIL_FROM` to an address on it. `WINBACK_SECRET` is set; still need `CRON_SECRET` (protects the drip cron in prod) and `STRIPE_WEBHOOK_SECRET` (from `stripe listen`).
- Vercel Cron is hourly (`vercel.json`); on the Hobby plan reduce to daily if hourly is rejected.

Still not present: auth (access is via the unguessable token URL), analytics.

**Brand: Vivrun (renamed, done).** The consumer brand is **Vivrun** (domain `vivrun.com`), operated by **ColrosaStudios LTD**. Renamed across `app/layout.tsx` title, `app/page.tsx` hero eyebrow, `components/site-footer.tsx` (wordmark `VIVRUN` + "brand of ColrosaStudios LTD"), `components/legal-page.tsx`, the `/privacy` `/terms` `/cookies` titles + trading-name bodies, the five PDF `BRAND` consts (now `"VIVRUN"`, still duplicated across the docs - hoisting into `pdf-shared.tsx` remains a minor cleanup), the quickstart PDF footer domain (`vivrun.com`), and the email subject/preview. The product name (`PRODUCT.name`, "The Second Wind Protocol") is separate from the brand. Note: the page `<title>` keeps "AI Longevity Scan" as a generic SEO descriptor after "Vivrun |".

**Email sender domain + support inboxes pending (vivrun.com).** Production email must send from a verified `vivrun.com` address (currently `EMAIL_FROM=onboarding@resend.dev`, sandbox, owner-only). To do: verify `vivrun.com` in Resend (SPF/DKIM/DMARC DNS), set `EMAIL_FROM` to e.g. `reports@vivrun.com`; and set up real inboxes for `info@`/`support@` via an email host (Google Workspace or Zoho Mail) with MX records that coexist with Resend's sending records.

**Company + support details pending.** Legal pages name ColrosaStudios LTD but use bracketed `[company number to be added]` / `[registered office address to be added]` placeholders and have no support email yet. Fill these in once the company is registered and a support inbox exists. A solicitor review of `app/terms/page.tsx` before going live is advisable.

---

## 3. Key integration points

- **Checkout + payment:** `lib/guide/checkout.ts` (`beginCheckout`), `lib/stripe/server.ts`, `app/api/stripe/webhook/route.ts`, `lib/guide/fulfill.ts`, `lib/email/send.ts` (Resend). Order transitions in `lib/guide/orders.ts` (`createOrder(answers, status)`, `markPaid`, `markEmailed`). `lib/guide/start.ts`/`generate.ts` remain the no-payment fallback + generation entry.
- **Guide content:** `lib/guide/build-guide.ts` (deterministic engine) + `lib/guide/schema.ts` (`GuideDoc`). To change the guide, edit these; covered by `lib/guide/build-guide.test.ts`.
- **Order storage:** `lib/guide/orders.ts` (Supabase + in-memory backends) and `lib/supabase/server.ts` (service-role client, server-only).
- **Price/timer source of truth:** `components/sale-context.tsx` (`useSale()` exposes `currency`/`symbol`/`price`/`expiredPrice`/`winbackPrice`/`listPrice`/`stackValue`); `lib/product.ts` holds the per-currency `PRICES` table (USD/GBP/EUR/CAD/AUD) + `INCLUDED[]` (USD-authored, localized via `localizedValue`/`stackValueFor`; USD stack = 492, locked by `lib/product.test.ts`). Currency is geo-resolved server-side (`x-vercel-ip-country`, `?cur=` override) in `app/scan/page.tsx`. Format with `lib/money.ts` `formatMoney`; never hardcode `$` in UI.
- **Guide content:** `lib/guide/build-guide.ts` + `lib/guide/schema.ts` (`GuideDoc`, incl. `yourNumbers`/`bonusModules`/`trackers`/`recipeBank`/`exerciseLibrary`/`scienceNotes`/`programArc`) plus the data modules `lib/guide/recipes.ts`, `exercises.ts`, `science.ts`. Deterministic; covered by `lib/guide/build-guide.test.ts`. To change what the buyer gets, edit here.
- **Social proof data:** `lib/guide/testimonials.ts` (`TESTIMONIALS` with `quote`/`name`/`meta`/`detail`/`rating`/`verifiedAgo`; `TRANSFORMATIONS`, with the `weeks`/`stat` timeframe fields removed). Transformation images in `public/transformations/` are **static-imported** in `testimonials.ts` (content-hash fingerprinting busts caches on file swap) - do not switch back to string paths. Reviews UI (`components/reviews.tsx`) shows stars, verified-buyer badges, and an aggregate score; both reviews and transformations carry an asterisk results disclaimer linking to `/terms`. Do not add result-speed timeframes back to any social-proof or guide copy.
- **Downloadable kit (5 PDFs, 1 route):** `app/guide/[token]/download/[asset]/route.ts` serves `workbook | trackers | quickstart | recipes | exercises` via `renderToBuffer`; `/guide/[token]/pdf` redirects to `/download/workbook`. Documents: `components/guide/guide-pdf.tsx` (workbook), `tracker-pack-pdf.tsx`, `quickstart-pdf.tsx`, `recipe-book-pdf.tsx`, `exercise-library-pdf.tsx`, sharing `components/guide/pdf-shared.tsx` (fonts, palette `C`, tracker + content components, `coverStyles`). All must stay free of `fixed` running headers/footers - react-pdf 4.x crashes with "unsupported number" across the many pages and would 500 the route. `lib/guide/pdf-render.test.ts` is the guard.

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

Stripe + email + drip (now used): `STRIPE_SECRET_KEY` (test key set), `STRIPE_WEBHOOK_SECRET` (from `stripe listen`, not yet set), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY` + `EMAIL_FROM` (unset -> email is a logged no-op), `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET` (protects the drip cron), `WINBACK_SECRET` (signs win-back links; has an insecure dev fallback if unset). See `.env.example`.

Note: the Stripe + Supabase secrets were pasted into a chat transcript during setup; consider rotating the Supabase service-role key (the Stripe key is test-mode).

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
