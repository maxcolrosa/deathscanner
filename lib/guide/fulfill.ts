import "server-only";
import { markPaid, markEmailed } from "@/lib/guide/orders";
import { sendGuideEmail } from "@/lib/email/send";
import { getStripe } from "@/lib/stripe/server";

// One idempotent place for "a payment succeeded -> fulfill". Both the webhook
// (canonical) and the success-page fallback call this; markPaid only flips an
// "awaiting_payment" order, so exactly one caller wins and emails once.
export async function fulfillPaidOrder(
  token: string,
  sessionId: string,
  email: string | null
): Promise<void> {
  const flipped = await markPaid(token, { sessionId, email });
  if (!flipped) return; // already fulfilled by the other path
  if (email) {
    const sent = await sendGuideEmail(email, token);
    if (sent) await markEmailed(token);
  }
}

// Success-page verification: retrieve the session from Stripe and, if it is paid
// and belongs to this token, fulfill. Returns whether the order is paid.
export async function verifyCheckoutSession(
  token: string,
  sessionId: string
): Promise<boolean> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") return false;
  // Guard against a mismatched session_id pointing at another order's token.
  if (session.client_reference_id && session.client_reference_id !== token) {
    return false;
  }
  await fulfillPaidOrder(token, session.id, session.customer_details?.email ?? null);
  return true;
}
