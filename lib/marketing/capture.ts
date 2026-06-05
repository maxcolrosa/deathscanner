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
import { rateLimit } from "@/lib/marketing/rate-limit";

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

// Email gate: persist the lead (with their marketing consent) and send the free
// report email. The result email is the service the user asked for, so it sends
// regardless of `consented`. Throws on invalid input or abuse so the client
// surfaces a generic error; email delivery is best-effort and never throws.
//
// Abuse controls on this public, unauthenticated endpoint: bounded input
// (AnswersSchema caps + email max length), a best-effort per-IP rate limit, and
// the report email is sent ONLY on the first capture of an address (so it cannot
// be used to repeatedly mail a target). NOTE pre-launch hardening before Resend
// goes live: a CAPTCHA/Turnstile check, a durable shared-store rate limit, and
// optionally double opt-in for marketing consent. See AppState.md.
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

  // Best-effort per-IP throttle (in-process; defense-in-depth, not a guarantee).
  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0].trim() ||
    "unknown";
  if (!rateLimit(`capture:ip:${ip}`, 20, 10 * 60 * 1000)) {
    throw new Error("rate_limited");
  }

  // Only the first capture of an address sends the report email and enrolls the
  // drip, so a repeated post cannot be used to mail a target over and over.
  const existing = await getSubscriberByEmail(email);
  const isNew = !existing;

  await upsertSubscriber({ email, consented, answers, currency });

  // Enroll the marketing drip for fresh, consented, not-already-unsubscribed
  // addresses (enqueue is idempotent per email + kind).
  if (consented && !existing?.unsubscribed_at) {
    try {
      await enqueueDrip(email);
    } catch (err) {
      console.error("[capture] drip enqueue failed:", err);
    }
  }

  if (isNew) {
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
