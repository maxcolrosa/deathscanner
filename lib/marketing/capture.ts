"use server";

import { z } from "zod";
import { AnswersSchema } from "@/lib/guide/schema";
import { computeResult, type Answers } from "@/lib/longevity";
import { upsertSubscriber } from "@/lib/marketing/subscribers";
import { sendReportEmail, siteUrl } from "@/lib/email/send";
import { PRICES, type Currency } from "@/lib/product";
import { formatMoney, isCurrency } from "@/lib/money";

const deathDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const CaptureSchema = z.object({
  email: z.string().trim().email(),
  consented: z.boolean(),
  currency: z.string().optional(),
});

export interface CaptureLeadInput {
  email: string;
  consented: boolean;
  answers: Answers;
  currency?: string;
}

// Email gate: persist the lead (with their marketing consent) and send the free
// report email. The result email is the service the user asked for, so it sends
// regardless of `consented`. Throws on invalid input so the client can surface an
// error; email delivery is best-effort and never throws.
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

  await upsertSubscriber({ email, consented, answers, currency });

  // Phase 5: enqueue drip if consented.

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

  return { ok: true };
}
