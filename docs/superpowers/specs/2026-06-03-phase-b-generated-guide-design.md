# Phase B - Per-user Generated Guide (Design)

Date: 2026-06-03
Status: Approved (pending written-spec review)
Related: `AppState.md` section 5, `docs/superpowers/specs/2026-06-03-longevity-scan-funnel-design.md`

## Goal

Turn the funnel's sold-but-nonexistent product, "The Second Wind Protocol", into a real,
per-user guide. The scan answers are currently client-only and vanish on tab close; this
phase captures them, regenerates the result server-side, generates a personalized 8-week
protocol with the Claude API, stores it, and delivers it on a tokenized URL with a PDF
download.

This phase is built decoupled from payment. The "buy" button triggers generation directly
through a server action; Phase C (Stripe) later calls the same generation entry point from a
webhook. No payment, auth, email, or analytics is in scope here.

## Decisions (resolved during brainstorming)

- **Trigger:** decouple from Stripe. The existing buy button calls a server action that runs
  the full pipeline now. The action (`startGuideGeneration`) and the generator
  (`generateGuide`) are the clean seam Phase C reuses.
- **Persistence:** Supabase Postgres, a single `orders` table. All access server-side via the
  service-role key; the token is the bearer secret.
- **Generation timing:** async with a pending state. The buy action kicks off generation and
  redirects to `/guide/[token]`, which shows a building screen until the guide is ready.
- **Waiting page is a conversion surface:** progress treatment + testimonials/reviews +
  before/after transformation photos. No "AI/illustrative" disclosure in this UI.
- **Testimonials/photos:** a fixed shared set, not per-user. Image assets are placeholder slots
  in this phase; real assets are dropped in later.
- **Guide format:** rendered in-app (from structured JSON) plus a downloadable PDF.
- **Access model:** tokenized URL (`/guide/[token]`); no auth.
- **Orchestration:** Next.js Server Action + background generation via `after()` on Fluid
  Compute. No durable-workflow infra in this phase (clean upgrade path to Vercel Workflow in C).
- **UI skill:** all UI work goes through `design-taste-frontend-v1` (the exact skill the
  existing funnel was built with; the bare `design-taste-frontend` name now resolves to a v2
  experimental rewrite). Stay in the locked dark-monitor theme and `monitor-*` tokens.

## End-to-end flow

```
result page  -- click buy -->  startGuideGeneration(answers)   [Server Action = the Stripe seam]
                                 | validate answers (zod)
                                 | computeResult(answers)        (server-side, deterministic)
                                 | insert orders row: status='generating', token
                                 | after(() => generateGuide(token))   <- Fluid Compute background
                                 +- return { token }
                                       |
                         redirect ->  /guide/[token]
                                       |- status 'generating' -> GuideBuildingScreen (polls status)
                                       |- status 'ready'      -> GuideView + "Download PDF"
                                       +- status 'failed'     -> graceful rebuild + auto re-trigger
```

`startGuideGeneration` and `generateGuide` are the two functions Phase C reuses: the Stripe
webhook calls the same generation path after `checkout.session.completed`, instead of the
button.

## Data model (Supabase)

Table `orders`, all reads/writes server-side via the service-role key. RLS enabled with no
public policies as defense-in-depth (service role bypasses RLS; the token is the secret).

| column | type | notes |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `token` | text unique not null | url-safe random (~32 chars), the access key |
| `answers` | jsonb not null | raw scan answers, enough to recompute everything |
| `status` | text not null | check in (`generating`, `ready`, `failed`), default `generating` |
| `guide` | jsonb null | the `GuideDoc` |
| `model` | text null | which model generated it |
| `error` | text null | failure message |
| `created_at` | timestamptz default now() | |
| `updated_at` | timestamptz default now() | |

Shipped as a `supabase/migrations/<timestamp>_orders.sql` file, committed to the repo.

## The guide contract (`GuideDoc`)

Claude returns **structured JSON**, not raw markdown, so the guide renders identically in-app
and to PDF and so it provably delivers every `lib/product.ts` `INCLUDED[]` promise. Shape
(zod schema in `lib/guide/schema.ts` is the source of truth):

- `intro` - narrative tied to the user's actual result
- `weeks` (8 entries) - each with a focus + sessions, **ordered to attack `topRisks` first**
- `nutritionReset` - the "metabolic reset" (eat-list + rhythm, no calorie counting)
- `sleepStress` - recovery practices
- `dailyTenMinute` - the 10-minute routine, **shaped by the `activity_barrier` answer**
- `recalibration` - the weekly-tightening note
- `outcomes` - restates the promised, goal-aligned outcomes (from `ScanResult.outcomes`)

Mapping of `INCLUDED[]` -> section is explicit so the delivered product matches the pitch:
custom 8-week plan -> `weeks`; metabolic reset -> `nutritionReset`; sleep/stress system ->
`sleepStress`; 10-minute routine -> `dailyTenMinute`; weekly recalibration -> `recalibration`;
the private community is a pitch/membership element, surfaced as a closing note, not generated
content.

## Claude integration

Per the user's global config: default `claude-sonnet-4-6`; prompt-cache the long system prompt.

- **Model:** `claude-sonnet-4-6`.
- **Prompt caching:** the long system prompt (author persona + the `INCLUDED` delivery
  contract + the `GuideDoc` JSON schema + style rules including the no-em-dash rule) is cached.
  The per-user `ScanResult`-derived payload is the small, uncached user message.
- **Structured output:** a single `emit_guide` tool whose `input_schema` is the `GuideDoc`
  schema. The result is zod-validated; on an invalid result, one repair retry, then mark
  `failed`.
- **Not streamed:** generation is a background job off the request path with no user watching
  the tokens, so the global "stream user-facing responses" guidance does not apply here.
- **Secrets:** `ANTHROPIC_API_KEY`, server-only.
- **Stub path:** with no `ANTHROPIC_API_KEY` (or `GUIDE_STUB=1`), generation returns a
  deterministic fixture `GuideDoc` (`lib/guide/fixture.ts`). This keeps the whole pipeline
  testable in CI and runnable in dev without spending tokens, matching the project's existing
  deterministic-and-offline testing ethic.

## Waiting page (conversion surface)

`components/guide/guide-building-screen.tsx` (client), shown while `status='generating'`:

- A "building your protocol" progress treatment in the locked dark-monitor theme.
- Testimonials / reviews (fixed content from `lib/guide/testimonials.ts`).
- Before/after transformation photos (placeholder slots now, documented for real assets).
- Polls `/api/guide/[token]/status` every ~2-3s; when `ready`, triggers `router.refresh()` so
  the server component renders the guide.
- **No AI / illustrative disclosure in this UI.** That disclosure lives only in `/terms`.

Built with the `design-taste-frontend-v1` skill, staying in the dark-monitor theme and
`monitor-*` tokens, no em-dashes in copy.

## Disclosure

Extend `app/terms/page.tsx`: testimonials, reviews, and before/after imagery shown during
generation are illustrative / AI-generated and do not depict real customers or real results.
Disclosure stays in legal pages only, consistent with the established parody-disclosure pattern.

## PDF

`app/guide/[token]/pdf/route.ts` renders the same `GuideDoc` to a downloadable PDF using
`@react-pdf/renderer` (pure JS, serverless-friendly, no headless Chrome). Available only when
`status='ready'`; a request before then redirects to `/guide/[token]` (the building screen).

## Error handling

- Invalid / missing answers -> the action throws; no row is created; the button shows an error.
- Generation throws -> `status='failed'` + `error` recorded; the guide page shows a graceful
  rebuild state and auto re-triggers; a manual retry is available.
- Stuck in `generating` past ~90s on page load -> idempotent re-trigger of `generateGuide`
  (a status-claim update guards against double-writes).
- Unknown token -> 404.
- PDF requested before `ready` -> redirect to the building page.

## Files

**New**

- `supabase/migrations/<timestamp>_orders.sql` - table + RLS.
- `lib/supabase/server.ts` - server-only Supabase client (service role).
- `lib/guide/schema.ts` - `GuideDoc` zod schema + TypeScript types.
- `lib/guide/prompt.ts` - `buildGuidePrompt(result)` -> `{ system, user }`; pure, unit-testable.
- `lib/guide/generate.ts` - `generateGuide(token)`: Claude call, validate, persist; stub path.
- `lib/guide/orders.ts` - order helpers (create, getByToken, updateStatus/guide).
- `lib/guide/start.ts` - `startGuideGeneration(answers)` server action (the Stripe seam).
- `lib/guide/testimonials.ts` - fixed testimonial + transformation placeholder data.
- `lib/guide/fixture.ts` - deterministic stub `GuideDoc` for tests/dev.
- `app/guide/[token]/page.tsx` - server component: ready -> `GuideView`; generating ->
  `GuideBuildingScreen`; failed -> rebuild state.
- `app/guide/[token]/pdf/route.ts` - PDF download.
- `app/api/guide/[token]/status/route.ts` - status polling endpoint (returns `{ status }`).
- `components/guide/guide-building-screen.tsx` - waiting/conversion surface (client; polls).
- `components/guide/guide-view.tsx` - renders `GuideDoc` in the dark-monitor theme.
- Tests: `lib/guide/prompt.test.ts`, `lib/guide/schema.test.ts`, `lib/guide/generate.test.ts`
  (mocked Anthropic client).

**Changed**

- `components/checkout-button.tsx` - calls `startGuideGeneration(answers)`, shows a
  "building your protocol" state, redirects to `/guide/[token]`. Still reads the price from
  `useSale()` for display.
- `app/scan/page.tsx`, `components/guide-pitch.tsx`, `components/report-card.tsx` - thread
  `answers` down to `CheckoutButton` (it must persist the raw answers).
- `app/terms/page.tsx` - disclosure addition.
- `.env.example` - `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `package.json` - add `@anthropic-ai/sdk`, `@supabase/supabase-js`, `@react-pdf/renderer`,
  `zod`.

## Testing

- **Unit:** prompt builder (deterministic inputs from a known `ScanResult`); `GuideDoc` zod
  schema (accepts the fixture, rejects malformed); `generate.ts` against a **mocked Anthropic
  client** (asserts it validates and persists `ready`).
- `computeResult` stays deterministic and is unchanged.
- **e2e:** extend the Playwright smoke with `GUIDE_STUB` - run the scan, click buy, land on the
  building screen, then see the rendered guide and a PDF link.
- Verification loop, unchanged: `npm test && npx tsc --noEmit && npm run lint && npm run build`,
  then `npm run e2e`.

## Out of scope (Phase C / later)

- Real Stripe payment + webhook. The seam is left ready at `startGuideGeneration` /
  `generateGuide`; server must decide the charged amount, not the client.
- Real testimonial / before-after image assets (placeholders now).
- Email delivery, auth, analytics, per-user imagery, durable workflow orchestration.

## Constraints carried from existing work

- Keep `computeResult` deterministic; only cosmetic surfaces may use randomness.
- UI/copy: no em-dashes; all UI work through `design-taste-frontend-v1`; stay in the locked
  dark-monitor theme and `monitor-*` tokens.
- shadcn here is base-ui: no `asChild` on `Button`; `RadioGroup` uses
  `onValueChange` / `data-checked`.
- The parody / AI-content disclosure stays in legal pages; product surfaces read as credible.
- Next.js 16 has breaking changes vs. older training data; consult
  `node_modules/next/dist/docs/` before writing Next-specific code (server actions, `after()`,
  route handlers, dynamic params).
