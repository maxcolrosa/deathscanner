# Wire real payment: Stripe hosted Checkout + email delivery

Status: planned (not yet executed). Trigger to build: "execute the Stripe plan".
Design spec: `docs/superpowers/specs/2026-06-05-stripe-payment-design.md`.

## Context

The funnel sells a real $13 digital product but takes no money: clicking buy calls
`startGuideGeneration(answers)` which creates an order (`generating`) and routes to
`/guide/[token]`, where the building screen polls `/api/guide/[token]/status` and
`generateGuide` runs on first poll. `lib/guide/start.ts` + `generateGuide` were
deliberately left as the fulfillment seam for Stripe. Goal: insert a real payment
step (hosted Stripe Checkout) before fulfillment, deliver the guide on success,
and email the buyer their link, without breaking local dev or the e2e smoke.

### Decisions locked (with the user)
- **Hosted Stripe Checkout** (redirect to Stripe, back to the guide). No client Stripe SDK.
- **Charge what the buyer sees:** server charges `PRODUCT.price` ($13), or `PRODUCT.expiredPrice`
  ($24) if their countdown has expired. The only client input is the `expired` boolean from
  `useSale()`; the server selects between the two server-defined amounts (never trusts an
  arbitrary client amount).
- **Email the guide link** after payment (in addition to the success redirect). Use **Resend**.
- **User has a Stripe account**, so we verify a real test-mode payment during the build.
- Defaults (one-line swaps): **currency USD** (matches the "$" UI); **Resend** as the sender.
- **Graceful fallback:** mirror the Supabase/in-memory pattern. When `STRIPE_SECRET_KEY` is
  unset, keep today's direct-generate behavior so dev + Playwright e2e pass with no keys.
  When `RESEND_API_KEY` is unset, skip email (no-op).

## Flow (when Stripe is configured)

1. Buy click -> server action `beginCheckout(answers, expired)`:
   validate answers, create a **pending order** (`awaiting_payment`, storing answers + token),
   create a Stripe Checkout Session (`mode: payment`, amount = expired ? expiredPrice : price,
   currency usd, `client_reference_id` = token, `success_url` = `${SITE_URL}/guide/{token}?session_id={CHECKOUT_SESSION_ID}`,
   `cancel_url` back to the result page), return `{ url }`. Client does `window.location = url`.
2. Stripe collects card + email, charges, redirects to the success URL.
3. **Webhook** `/api/stripe/webhook` (`checkout.session.completed`, paid): flip the order
   `awaiting_payment -> generating` (idempotent), store `stripe_session_id`/`customer_email`/`paid_at`,
   and send the guide email once. Generation then runs as today on the building-screen poll.
4. **Success-page fallback:** `/guide/[token]?session_id=…` page: if the order is still
   `awaiting_payment` and a `session_id` is present, retrieve the session from Stripe and, if
   paid, flip it (+ email) right there. Covers webhook delay and local dev without the CLI.
   An `awaiting_payment` order that is NOT paid shows a "payment not completed" state, never the guide.

When Stripe is NOT configured, `beginCheckout` returns `{ token }` (today's direct path) and the
client routes straight to `/guide/{token}`.

## The build

### 1. Dependencies + server clients
- `npm install stripe resend`.
- `lib/stripe/server.ts`: server-only Stripe client (pin `apiVersion`), `stripeConfigured()` helper
  reading `STRIPE_SECRET_KEY`.
- `lib/email/send.ts`: Resend-backed `sendGuideEmail(to, token)` building an absolute
  `${SITE_URL}/guide/{token}` link; no-op + log when `RESEND_API_KEY` unset; `from` from `EMAIL_FROM`.
- Env added (document in `.env.local` + AppState): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL` (absolute base for redirect + email links).

### 2. Orders schema + store (`lib/guide/orders.ts` + new migration)
- New migration `supabase/migrations/<ts>_orders_payment.sql`: extend the status check to include
  `awaiting_payment`; add columns `stripe_session_id text`, `customer_email text`, `paid_at timestamptz`,
  `emailed_at timestamptz`.
- `OrderStatus` add `"awaiting_payment"`. `createOrder(answers, status = "generating")` accepts an
  initial status (pending orders pass `awaiting_payment`; the fallback path keeps `generating`).
- Add `markPaid(token, { sessionId, email })` (sets status `generating` + payment fields, only when
  currently `awaiting_payment`, so it is idempotent) and `markEmailed(token)`. Mirror all in the
  in-memory store.

### 3. Checkout action (`lib/guide/checkout.ts`, server)
- `beginCheckout(answers, expired)`: validate via `AnswersSchema`. If `stripeConfigured()`:
  `createOrder(answers, "awaiting_payment")`, create the Checkout Session (server-side amount),
  return `{ url: session.url }`. Else: `createOrder(answers)` (today's path), return `{ token }`.
- Keep `startGuideGeneration` in `lib/guide/start.ts` as the shared fulfillment entry (used by the
  fallback and reused by webhook/success-verify via `markPaid`).

### 4. Webhook (`app/api/stripe/webhook/route.ts`)
- `runtime = "nodejs"`, `dynamic = "force-dynamic"`. Read the RAW body (`await req.text()`), verify
  with `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`. On `checkout.session.completed`
  with `payment_status === "paid"`: resolve token from `client_reference_id`, `markPaid(...)`, then
  `sendGuideEmail` if not already emailed. Return 200 fast; 400 on signature failure. Idempotent on retries.

### 5. Success-page verification (`app/guide/[token]/page.tsx`)
- Read async `searchParams`. If `order.status === "awaiting_payment"`: when `session_id` is present,
  retrieve the session; if paid, `markPaid` (+ email) and render the building screen; if not paid,
  render a compact "payment not completed" panel with a link back to the offer. Leave the
  `ready`/`generating` paths untouched.

### 6. Client wiring (`components/use-checkout.ts`)
- Replace the `startGuideGeneration` call with `beginCheckout(answers, expired)` where `expired`
  comes from `useSale()` inside the hook (callers unchanged). On `{ url }` -> `window.location.assign(url)`;
  on `{ token }` -> `router.push('/guide/' + token)`. `CheckoutButton`/`ReportCard`/`ResultStickyBar`
  keep using `useCheckout` as-is.

### 7. Tests + docs
- Unit (`vitest`): amount selection (expired -> 2400, else 1300) ; `markPaid` idempotency
  (second call is a no-op) ; email skipped when `RESEND_API_KEY` unset. Mock the Stripe/Resend
  clients; do not hit the network.
- Keep the Playwright smoke green by preserving the no-Stripe fallback (it runs without keys).
- Update `CLAUDE.md` + `AppState.md`: the new payment flow, the seam, env vars, and the
  "ANTHROPIC_API_KEY no longer used" cleanup note stays accurate.

## Critical files

- new: `lib/stripe/server.ts`, `lib/email/send.ts`, `lib/guide/checkout.ts`,
  `app/api/stripe/webhook/route.ts`, `supabase/migrations/<ts>_orders_payment.sql`
- edit: `lib/guide/orders.ts` (status + `markPaid`/fields), `components/use-checkout.ts`,
  `app/guide/[token]/page.tsx` (awaiting_payment + session verify), `lib/guide/start.ts` (unchanged seam),
  `lib/product.ts` (read-only: amounts), `.env.local`, `CLAUDE.md`, `AppState.md`
- reuse: `createOrder`/`getOrderByToken`/`markReady` (`lib/guide/orders.ts`), `generateGuide`
  (`lib/guide/generate.ts`), `AnswersSchema` (`lib/guide/schema.ts`), `PRODUCT` (`lib/product.ts`),
  `useSale` (`components/sale-context.tsx`). Follow the `stripe:stripe-best-practices` skill.

## Keys the user provides (test mode first)

`STRIPE_SECRET_KEY` (test `sk_test_…`), `STRIPE_WEBHOOK_SECRET` (from `stripe listen`),
`RESEND_API_KEY` (+ a verified `EMAIL_FROM`, or the Resend sandbox sender for test),
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local. Stripe CLI may need installing
(`brew install stripe/stripe-cli/stripe`).

## Verification

1. No-keys path: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run e2e`
   all pass unchanged (fallback direct-generate).
2. With test keys in `.env.local`: run `stripe listen --forward-to localhost:3000/api/stripe/webhook`,
   start `npm run dev`, complete a scan, click buy -> redirected to Stripe -> pay with test card
   `4242 4242 4242 4242` -> redirected to `/guide/[token]` which builds and shows the kit; confirm the
   webhook flipped the order to paid and the guide email arrived.
3. Confirm an unpaid/abandoned checkout never exposes a guide (the `awaiting_payment` panel shows instead).
4. Confirm the charged amount matches the displayed price ($13 normally, $24 after the countdown ends).
