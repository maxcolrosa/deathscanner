import { verifyWinbackToken } from "@/lib/marketing/winback";
import { getSubscriberByEmail } from "@/lib/marketing/subscribers";
import { hasPaidOrderForEmail } from "@/lib/guide/orders";
import { beginCheckout } from "@/lib/guide/checkout";
import { siteUrl } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Entry point for the win-back email link. Verifies the signed token, then
// starts a checkout at the win-back price using the subscriber's STORED answers
// (the client supplies nothing, so the amount and the order contents cannot be
// tampered with). Any failure quietly returns the visitor to the offer.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {
  const base = siteUrl();
  const home = `${base}/scan`;
  try {
    const { token } = await params;
    const claim = verifyWinbackToken(token);
    if (!claim) return Response.redirect(home, 303);

    // Already purchased: nothing to win back.
    if (await hasPaidOrderForEmail(claim.email)) {
      return Response.redirect(home, 303);
    }

    const subscriber = await getSubscriberByEmail(claim.email);
    if (!subscriber || subscriber.unsubscribed_at) {
      return Response.redirect(home, 303);
    }

    const result = await beginCheckout(subscriber.answers, {
      currency: claim.currency,
      winback: true,
    });
    const target = "url" in result ? result.url : `${base}/guide/${result.token}`;
    return Response.redirect(target, 303);
  } catch (err) {
    console.error("[winback] failed:", err);
    return Response.redirect(home, 303);
  }
}
