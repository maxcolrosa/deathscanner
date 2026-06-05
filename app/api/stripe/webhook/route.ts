import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/stripe/server";
import { fulfillPaidOrder } from "@/lib/guide/fulfill";

// Canonical fulfillment path. Needs the raw request body for signature
// verification, so it runs on the Node runtime and reads req.text() directly.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  if (!stripeConfigured()) {
    return new Response("stripe not configured", { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("webhook secret not configured", { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("missing stripe-signature", { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    // Bad signature or malformed payload: reject, do nothing.
    return new Response("signature verification failed", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid" && session.client_reference_id) {
      await fulfillPaidOrder(
        session.client_reference_id,
        session.id,
        session.customer_details?.email ?? null
      );
    }
  }

  // Acknowledge fast. Idempotency makes retried events safe no-ops.
  return new Response("ok", { status: 200 });
}
