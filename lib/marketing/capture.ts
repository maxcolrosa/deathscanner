"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { AnswersSchema } from "@/lib/guide/schema";
import { computeResult, type Answers } from "@/lib/longevity";
import { upsertSubscriber, getSubscriberByEmail } from "@/lib/marketing/subscribers";
import { enqueueDrip } from "@/lib/marketing/email-jobs";
import { sendReportEmail, siteUrl } from "@/lib/email/send";
import { PRICES, type Currency } from "@/lib/product";
import { formatMoney, isCurrency } from "@/lib/money";
import { rateLimitDurable } from "@/lib/marketing/rate-limit";

const deathDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const CaptureSchema = z.object({
  // Cap length so the public endpoint cannot be used to store giant strings.
  email: z.string().trim().email().max(254),
  consented: z.boolean(),
  currency: z.string().max(8).optional(),
});

export interface CaptureLeadInput {
  email: string;
  consented: boolean;
  answers: Answers;
  currency?: string;
}

// Per-IP coarse throttle: blunts one source hammering the endpoint / spraying
// many addresses fast. Shared NAT (offices, schools) sits behind one IP, so it
// is deliberately generous and is NOT the per-recipient control.
const IP_MAX = 20;
const IP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// Per-EMAIL cap: the real anti-bomb control. It is keyed on the recipient, so
// it bounds how many report emails any single address can receive no matter how
// many IPs an attacker rotates through. Generous enough for a genuine returning
// user (re-scans are days apart, not many-per-day), strict enough that a victim
// can never be flooded. There is no CAPTCHA, so this cap is what keeps a public,
// unauthenticated endpoint from being turned into an email bomb against a third
// party. Tighten if abuse appears; a CAPTCHA/Turnstile check would let this be
// looser. See AppState.md.
const EMAIL_MAX = 3;
const EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Email gate: persist the lead (with their marketing consent) and send the free
// report email. The result email is the service the user asked for, so it sends
// regardless of `consented`. Throws on invalid input or per-IP abuse so the
// client surfaces a generic error; email delivery is best-effort and never
// throws. The report is transactional ("here is the result you asked for"), so
// it sends on every scan EXCEPT when the per-email cap is already spent for the
// day (which only happens under abuse or rapid repeat scans of one address).
//
// Abuse controls on this public, unauthenticated endpoint: bounded input
// (AnswersSchema caps + email max length), a durable per-IP throttle, and a
// durable per-email send cap (both survive across serverless instances via
// Supabase). Still-open hardening: a CAPTCHA/Turnstile check would let the
// per-email cap be looser, and double opt-in would prove ownership outright.
export async function captureLead(
  input: CaptureLeadInput
): Promise<{ ok: true }> {
  const { email, consented } = CaptureSchema.parse({
    email: input.email,
    consented: input.consented,
    currency: input.currency,
  });
  const answers = AnswersSchema.parse(input.answers) as Answers;

  const upper = input.currency?.toUpperCase();
  const currency: Currency = isCurrency(upper) ? upper : "USD";

  // Durable per-IP throttle (coarse; defense-in-depth against rapid hammering).
  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0].trim() ||
    "unknown";
  if (!(await rateLimitDurable(`capture:ip:${ip}`, IP_MAX, IP_WINDOW_MS))) {
    throw new Error("rate_limited");
  }

  // Durable per-email cap: the recipient-keyed control that actually prevents
  // email-bombing a third party. Checked before sending; if spent, we skip the
  // send silently (still returning ok, so we never reveal to a prospective
  // abuser whether the address was mailed). Normalized to lowercase so casing
  // tricks cannot multiply the budget for one human.
  const emailKey = `capture:email:${email.toLowerCase()}`;
  const mayEmail = await rateLimitDurable(emailKey, EMAIL_MAX, EMAIL_WINDOW_MS);

  // Look up any existing subscriber so we do not re-enroll one who unsubscribed.
  const existing = await getSubscriberByEmail(email);

  await upsertSubscriber({ email, consented, answers, currency });

  // Enroll the marketing drip for consented, not-already-unsubscribed addresses
  // (enqueue is idempotent per email + kind).
  if (consented && !existing?.unsubscribed_at) {
    try {
      await enqueueDrip(email);
    } catch (err) {
      console.error("[capture] drip enqueue failed:", err);
    }
  }

  // Send the personalized report, unless this address has hit its daily cap.
  if (mayEmail) {
    try {
      const result = computeResult(answers);
      await sendReportEmail(email, {
        deathDate: deathDateFormatter.format(result.predictedDeathDate),
        ageAtDeath: result.ageAtDeath,
        recoverableYears: result.recoverableYears,
        topRisks: result.topRisks.slice(0, 3).map((r) => ({
          category: r.category,
          detail: r.detail,
        })),
        priceLabel: formatMoney(PRICES[currency].price, currency),
        offerUrl: `${siteUrl()}/scan`,
      });
    } catch (err) {
      console.error("[capture] report email failed:", err);
    }
  }

  return { ok: true };
}
