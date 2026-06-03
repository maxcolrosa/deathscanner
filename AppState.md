# AppState.md

Working handoff doc for The Longevity Scan. Captures the current state and everything needed to (A) push to GitHub, (B) build the real per-user "Second Wind Protocol" guide with a personalized tutorial, and (C) wire up Stripe checkout. Pair this with `CLAUDE.md` (architecture) and the specs in `docs/superpowers/`.

Last updated: 2026-06-03.

---

## 1. Current state (what exists today)

A complete, working **front-end-only** parody funnel, no backend:

- **Quiz → fake AI analysis → death-date report → sales pitch**, all client-side.
- Deterministic "model" in `lib/longevity.ts` (no real AI, no network). 23 passing unit tests, a Playwright smoke test, clean build/lint/tsc.
- Dark "diagnostic monitor" theme; results-based, personalized sales copy.
- An **in-memory, per-user sale countdown** that raises the price on expiry (`components/sale-context.tsx`).
- **Checkout is a non-functional placeholder.** Clicking buy shows "this is where Stripe would take your money."
- Legal pages (`/privacy`, `/terms`, `/cookies`) carry the parody disclosure.

**What does NOT exist yet (the next phases):**
- No git remote / GitHub repo (local only, branch `feat/longevity-scan`).
- No backend, database, auth, or persistence of any kind.
- No real payment (placeholder only).
- No real "Second Wind Protocol" product/guide. The guide pitch sells a product that is not built.
- **The user's scan answers are never sent anywhere.** They live only in React state and vanish on tab close. This is the single most important fact for the next two phases (see section 5).

Tech: Next.js 16 (App Router) / React 19 / TS / Tailwind v4 / Motion / Geist / shadcn-on-`@base-ui`. See `CLAUDE.md` for stack gotchas (base-ui `Button` has no `asChild`; `RadioGroup` uses `onValueChange`/`data-checked`; zero em-dashes in UI copy; Next 16 docs in `node_modules/next/dist/docs/`).

---

## 2. The data available to personalize the guide

This is the raw material for the per-user tutorial. It all comes from `lib/longevity.ts` and is **pure and deterministic**: the same answers always reproduce the same result, including server-side, so you only need to persist the answers to rebuild everything.

**`Answers`** = `Record<string, string | number>`, keyed by question id. Question ids (some are branching/unscored):
`age`, `sex`, `smoking`, `smoking_years` (only if a smoker), `bodycomp`, `activity`, `activity_barrier` (only if low activity; unscored), `diet`, `alcohol`, `sleep`, `stress`, `genetics`, `goal` (unscored). Get the live list with `getActiveQuestions(answers)`.

**`computeResult(answers, today?)` → `ScanResult`** (the personalization payload):
- `currentAge`, `lifeExpectancy`, `ageAtDeath`, `predictedDeathDate`
- `factors: RiskFactor[]` — every scored factor: `{ id, category, answerLabel, deltaYears, recoverable, detail, impact: "high"|"moderate"|"minor" }`
- `topRisks: RiskFactor[]` — the 3 biggest modifiable losses, worst first (what the guide should attack first)
- `strengths: RiskFactor[]` — what is already working
- `recoverableYears` — years regainable by fixing modifiable risks
- `outcomes: Outcome[]` — concrete, goal-aligned results (e.g. "Lose around 5 kg of body fat", "Rebuild your cardiovascular fitness")
- `primaryGoal` — the user's stated goal (`fat` | `strength` | `energy` | `heart` | null)
- `modelConfidence`

**Guide generation should be driven by:** `primaryGoal` (focus), `topRisks` (what to fix, in order), `activity_barrier` answer (how to make it stick), `bodycomp`/`activity`/`diet`/`sleep`/`stress` levels (intensity calibration), and `outcomes` (the promises to deliver on). The engine is React-free, so import and call `computeResult` directly in a server route / generation job.

`lib/product.ts` holds the product name, copy, prices, and the value-stack line items the pitch promises — the guide should actually deliver those.

---

## 3. Current funnel flow and integration points

```
app/page.tsx (landing)
  -> /scan  (app/scan/page.tsx)  CLIENT STATE MACHINE
       phase "quiz"      -> components/quiz-step.tsx  (answers collected in React state)
       phase "analyzing" -> components/analyzing-sequence.tsx (cosmetic, randomized)
       phase "result"    -> wrapped in <SaleProvider>:
                              components/report-card.tsx   (death date + drivers + above-fold CTA)
                              components/guide-pitch.tsx    (the offer)
                              components/result-sticky-bar.tsx (persistent CTA)
```

**Checkout integration point:** `components/checkout-button.tsx` is the ONLY file that needs to change to go live. It currently sets local state and shows a placeholder message. It reads the current price from `useSale()`.

**Price/timer source of truth:** `components/sale-context.tsx` (`useSale()` → `{ remaining, expired, price, listPrice }`). `lib/product.ts` holds `price` (19), `expiredPrice` (39), `listPrice` (79), `stackValue` (294), and `INCLUDED[]`.

---

## 4. Phase A — Push to GitHub

Currently local only, on branch `feat/longevity-scan`, no remote. `.gitignore` already covers `node_modules`, `.next`, `.env*`, Playwright artifacts. The CLAUDE.md edit is uncommitted; commit it first.

```bash
git add CLAUDE.md AppState.md && git commit -m "docs: project guidance and app state"

# Option 1: gh CLI (creates the repo and pushes)
gh repo create longevity-scan --private --source=. --remote=origin --push

# Option 2: manual
git remote add origin git@github.com:<you>/longevity-scan.git
git push -u origin feat/longevity-scan
```

Decide before pushing: keep building on `feat/longevity-scan`, or merge it to `main` first (no remote yet, so either is fine). The repo is Vercel-ready (`next build` passes); deploy is `vercel` / connect the repo.

---

## 5. Phase B — Per-user generated guide (the core new build)

**The problem to solve first:** scan answers are client-only and ephemeral. To deliver a guide tied to a purchase, you must capture the answers and carry them through checkout so a server can regenerate the result and build the guide. Recommended flow:

1. **Capture at checkout.** When the user clicks buy, send their `Answers` to the server (they are ~13 small key/values). Either:
   - pass them as Stripe Checkout Session `metadata` (note Stripe's limits: 50 keys, 500 chars/value — fine here, but JSON-stringify compactly), or
   - write an order record (answers + a generated token) to a DB first and pass only the record id through Stripe `client_reference_id`/`metadata`. **Preferred**, because it avoids metadata limits and gives you a place to store the generated guide.
2. **Regenerate server-side.** After payment, call `computeResult(answers)` on the server (pure, deterministic) to rebuild the `ScanResult`.
3. **Generate the guide with the Claude API.** Feed `primaryGoal`, `topRisks`, `activity_barrier`, the per-domain levels, and `outcomes` into a prompt that produces the personalized 8-week protocol + tutorial. Per the user's global config: default `claude-sonnet-4-6`, use prompt caching for the long system prompt, stream user-facing text. The guide must actually deliver what `lib/product.ts` `INCLUDED[]` promises (training plan ordered by `topRisks`, nutrition reset, sleep/stress, the 10-minute routine shaped by `activity_barrier`, etc.).
4. **Store + deliver.** Persist the generated guide to the order record. Since there is no auth, deliver via a unique tokenized URL (e.g. `/guide/[token]`) and/or email. Decide whether generation is synchronous on the success page or a background job (Vercel Workflow / queue) with a "your plan is being built" state.

**Suggested stack (matches the user's tooling):** Supabase (orders + generated guides + RLS) or Vercel Postgres for storage; Claude API for generation; Vercel for hosting/functions. The existing `/guide` page is a generic evergreen pitch and can become the template/shell for the real product surface.

---

## 6. Phase C — Stripe checkout

Wire into `components/checkout-button.tsx` (the single integration point). Two viable shapes:
- **Checkout Session via an API route** (recommended): create `app/api/checkout/route.ts` that creates a Session with the price, success/cancel URLs, and the answers reference (per section 5). Add a webhook route (`app/api/stripe/webhook/route.ts`) that verifies the signature and, on `checkout.session.completed`, triggers guide generation/fulfillment. Build a `/success` page that reads the session and shows (or kicks off) the guide.
- **Payment Link**: faster, but harder to attach per-user data and to trigger generation; only use if you drop the personalized-guide requirement.

Stripe notes: there is a `stripe` plugin/skill available (`stripe:stripe-best-practices`, `stripe:test-cards`, `stripe:explain-error`). Use test mode + test cards while building. The displayed price already follows the sale timer via `useSale()`, so pass the **current** `price` (sale vs. expired) into the Session, and validate it server-side rather than trusting the client.

---

## 7. Environment variables (none exist yet)

Create `.env.local` (already gitignored). Anticipated for phases B/C:

```
ANTHROPIC_API_KEY=            # Claude API for guide generation
STRIPE_SECRET_KEY=            # server-side Stripe
STRIPE_WEBHOOK_SECRET=        # verify webhook signatures
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # only if using Stripe.js on the client
# plus storage creds (Supabase URL/keys or Postgres connection string)
```

---

## 8. Open decisions to make before/while building

- **Branch/remote:** merge `feat/longevity-scan` to `main`, or keep developing on it?
- **Persistence layer:** Supabase vs. Vercel Postgres vs. Blob for orders + generated guides.
- **Generation timing:** synchronous on the success page vs. background job with a pending state.
- **Access model:** tokenized URL, email delivery, or add lightweight auth. (No auth exists today.)
- **Pricing integrity:** the timer can change the price ($19 → $39); the server must decide the real charged amount, not the client.
- **Guide format:** Markdown/HTML rendered in-app, a downloadable PDF, or both.
- **Regeneration/idempotency:** store the generated guide so a refresh does not re-bill or re-generate; key off the Stripe session/order id.

---

## 9. Constraints that carry into the new work

- Keep `computeResult` deterministic; only cosmetic surfaces (the analyzing log) may use randomness.
- UI/copy: no em-dashes; run UI through the `design-taste-frontend` skill; stay in the locked dark-monitor theme and `monitor-*` tokens.
- The parody disclosure stays in the legal pages; the product surfaces should still read as credible.
- shadcn here is base-ui: no `asChild` on `Button`; `RadioGroup` uses `onValueChange`/`data-checked`.
- Verification loop before shipping: `npm test && npx tsc --noEmit && npm run lint && npm run build`, then `npm run e2e`.
