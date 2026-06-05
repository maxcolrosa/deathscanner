# Phase D - Stripe Payment + Email Delivery (Design)

Date: 2026-06-05
Status: Approved (planned, not yet executed)
Related: `docs/superpowers/plans/2026-06-05-stripe-payment.md` (implementation steps),
`docs/superpowers/specs/2026-06-03-phase-b-generated-guide-design.md` (the fulfillment seam),
`CLAUDE.md`, `AppState.md`

## Goal

Turn the funnel from "click buy, get the guide free" into a real transaction: take payment with
Stripe before fulfilling, deliver the guide on success, and email the buyer their link. The
deterministic guide engine, the tokenized access model, and the building-screen experience all
stay exactly as they are. Payment is inserted in front of the existing
`startGuideGeneration`/`generateGuide` seam, which was built for this from the start.

## Resolved decisions (from discussion)

- **Hosted Stripe Checkout** (redirect to Stripe's page, return to the guide). No card UI to build,
  no client Stripe SDK, PCI handled by Stripe, 3DS/SCA and receipts included. Embedded Payment
  Element was considered and declined for v1 (more surface area for a $13 impulse buy).
- **Charge what the buyer sees.** The server charges `PRODUCT.price` ($13), or `PRODUCT.expiredPrice`
  ($24) when the visitor's countdown has expired. The only client input is the `expired` boolean
  from `useSale()`; the server maps it to one of two server-defined amounts and never trusts a
  client-supplied price. Tampering to pay $13 after expiry is an ~$11 self-inflicted discount, not a
  fraud vector, so cookie-level deadline enforcement is deferred.
- **Email the guide link** after payment, in addition to the success redirect, via **Resend**.
- **Currency USD** (matches the "$" shown in the UI). One-line change if GBP is preferred later.
- **Graceful degradation, mirroring the Supabase/in-memory pattern.** When `STRIPE_SECRET_KEY` is
  unset the funnel keeps today's direct-generate behavior (so local dev and the Playwright e2e pass
  with zero keys); when `RESEND_API_KEY` is unset, email is a logged no-op.
- **Constraints carried:** locked dark-monitor theme + `monitor-*` tokens; UI work through
  `design-taste-frontend-v1`; no em-dashes in user-facing strings; shadcn is base-ui; keep
  `computeResult`/`buildGuide` deterministic; Next 16 async `params`/`searchParams`; follow the
  `stripe:stripe-best-practices` skill (raw-body signature verification, idempotency, Node runtime).

## System design

### Order lifecycle

`awaiting_payment` (created at checkout, holds the answers) -> `generating` (set by verified
payment) -> `ready` (set by the existing deterministic build on the first status poll). `failed`
is unchanged. The fallback path (no Stripe) skips `awaiting_payment` and creates `generating`
directly, exactly as today.

### Data model (additions to `public.orders`)

- status check gains `awaiting_payment`.
- `stripe_session_id text`, `customer_email text`, `paid_at timestamptz`, `emailed_at timestamptz`.
- A new forward migration; the in-memory store mirrors the same fields. Access stays server-side via
  the service role; the unguessable token remains the only secret (RLS on, no public policies).

### Payment integrity

- The Checkout Session amount is computed server-side from `PRODUCT` (in minor units: 1300 / 2400),
  so the price is authoritative regardless of the client.
- The answers are stored in the pending order BEFORE redirect (not stuffed into Stripe metadata),
  so there is no metadata size limit and no way to alter the order contents through the client.
- `client_reference_id` carries the order token through the round-trip.

### Fulfillment (two paths, both idempotent)

1. **Webhook** `/api/stripe/webhook` is the canonical fulfillment: verify the Stripe signature,
   handle `checkout.session.completed` with `payment_status === "paid"`, flip the order
   `awaiting_payment -> generating`, persist the payment fields, and send the email once
   (`emailed_at` guard). Idempotent: a retried event whose order is already past `awaiting_payment`
   is a no-op.
2. **Success-page verification** is a belt-and-suspenders fallback for webhook latency and local dev
   without the Stripe CLI: on `/guide/[token]?session_id=...`, if the order is still
   `awaiting_payment`, retrieve the session and, if paid, flip it (+ email) inline. Either path
   reaches the same state; whichever runs first wins, the other no-ops.

`markPaid` only transitions from `awaiting_payment`, which is what makes both paths safe to run.

### Access control

An `awaiting_payment` order that is not paid never renders the guide; the page shows a compact
"payment not completed" panel with a link back to the offer. Only a paid (or fallback-direct) order
reaches `generating`/`ready`.

### Delivery

- Success `redirect` returns the buyer to `/guide/[token]`, which builds and shows the downloadable
  kit, exactly as today.
- Resend sends a transactional email with an absolute `${SITE_URL}/guide/[token]` link so the buyer
  can return later. Stripe also emails its own receipt. The buyer email comes from the Checkout
  Session's `customer_details.email`.

## Failure modes and handling

- **Signature mismatch / malformed webhook:** return 400, do nothing.
- **Webhook delayed or undelivered:** the success-page verification fulfills instead.
- **Email send fails or unconfigured:** the guide is still delivered via the redirect; email is
  best-effort and logged, never blocking fulfillment.
- **Abandoned checkout:** order stays `awaiting_payment` (harmless; no guide exposed). Optional
  later cleanup, not required for v1.
- **Stripe down / session creation fails:** the buy action surfaces the existing inline error state
  in `CheckoutButton`.

## Out of scope (v1)

- Auth/accounts (the tokenized URL is still the access mechanism), subscriptions, and saved cards.
- Stripe Tax / VAT automation, invoicing, coupons, and Stripe-hosted customer portal.
- Server-enforced countdown deadline (cookie) - deferred; the $13/$24 selection is client-signalled
  and clamped to two server amounts.
- Live-mode launch, payouts, and dispute/refund automation (handled in the Stripe dashboard; the
  `/terms` digital-goods + immediate-access cancellation waiver already covers the policy).
- Per-order analytics beyond what Stripe provides.

## Verification

See the plan's Verification section. In short: the no-keys path keeps the full local loop green
(`npm test`, `tsc`, `lint`, `build`, `e2e`); with test keys plus `stripe listen`, a `4242` test-card
purchase must redirect to the built guide, flip the order to paid via the webhook, deliver the
email, and charge the displayed amount, while an unpaid checkout never exposes a guide.
