import { redirect } from "next/navigation";
import { ResultView } from "@/components/result-view";
import { verifyResultToken } from "@/lib/marketing/email-links";
import { getSubscriberByEmail } from "@/lib/marketing/subscribers";
import { isCurrency } from "@/lib/money";

// Tokenized "see your result" link from the report email. The token is a signed
// HMAC over the recipient's email + currency (lib/marketing/email-links.ts); we
// verify it, load the subscriber's stored answers, and re-render the exact same
// reveal + pitch they saw live. No re-quizzing. A bad, expired, or unknown token
// falls back to a fresh scan. Dynamic so the lookup runs per request.
export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const claim = verifyResultToken(token);
  if (!claim) redirect("/scan");

  const subscriber = await getSubscriberByEmail(claim.email);
  if (!subscriber) redirect("/scan");

  // Prefer the currency baked into the signed token; fall back to whatever the
  // subscriber row stored.
  const currency = isCurrency(claim.currency)
    ? claim.currency
    : isCurrency(subscriber.currency)
      ? subscriber.currency
      : "USD";

  return <ResultView answers={subscriber.answers} currency={currency} />;
}
