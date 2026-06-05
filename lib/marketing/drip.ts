import "server-only";
import {
  listDueJobs,
  markJobSent,
  markJobCanceled,
  type EmailJob,
} from "@/lib/marketing/email-jobs";
import { getSubscriberByEmail } from "@/lib/marketing/subscribers";
import { hasPaidOrderForEmail } from "@/lib/guide/orders";
import { computeResult } from "@/lib/longevity";
import { sendValueEmail, sendWinbackEmail, siteUrl } from "@/lib/email/send";
import { signWinbackToken } from "@/lib/marketing/winback";
import { PRICES, type Currency } from "@/lib/product";
import { formatMoney, isCurrency } from "@/lib/money";

export interface DripRunResult {
  due: number;
  sent: number;
  suppressed: number;
}

// Process all due drip jobs once. Called by the Vercel Cron. Idempotent: a job
// is marked sent (or canceled) as it is handled, so a later run does not repeat
// it. Suppresses anyone who unsubscribed or has since purchased.
export async function processDueJobs(now = Date.now()): Promise<DripRunResult> {
  const due = await listDueJobs(now);
  let sent = 0;
  let suppressed = 0;

  for (const job of due) {
    const subscriber = await getSubscriberByEmail(job.email);

    // Suppress: gone, unsubscribed, no longer consented, or already bought.
    if (
      !subscriber ||
      subscriber.unsubscribed_at ||
      !subscriber.consented ||
      (await hasPaidOrderForEmail(job.email))
    ) {
      await markJobCanceled(job.id);
      suppressed += 1;
      continue;
    }

    const currency: Currency = isCurrency(subscriber.currency)
      ? subscriber.currency
      : "USD";

    try {
      await sendJob(job, subscriber.answers, currency);
    } catch (err) {
      console.error(`[drip] send failed for job ${job.id}:`, err);
    }
    // Mark sent after attempting so a no-op (unconfigured Resend) or a render
    // does not loop forever. Transient-failure retry is a future enhancement.
    await markJobSent(job.id);
    sent += 1;
  }

  return { due: due.length, sent, suppressed };
}

async function sendJob(
  job: EmailJob,
  answers: Parameters<typeof computeResult>[0],
  currency: Currency
): Promise<void> {
  const base = siteUrl();
  if (job.kind === "value") {
    const result = computeResult(answers);
    await sendValueEmail(job.email, {
      recoverableYears: result.recoverableYears,
      topRiskCategory: result.topRisks[0]?.category ?? null,
      offerUrl: `${base}/scan`,
    });
    return;
  }
  // win-back
  const tier = PRICES[currency];
  const token = signWinbackToken(job.email, currency);
  await sendWinbackEmail(job.email, {
    winbackPriceLabel: formatMoney(tier.winbackPrice, currency),
    listPriceLabel: formatMoney(tier.listPrice, currency),
    winbackUrl: `${base}/api/winback/${token}`,
  });
}
