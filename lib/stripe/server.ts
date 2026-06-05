import "server-only";
import Stripe from "stripe";

// Server-only Stripe client. The funnel degrades gracefully: when
// STRIPE_SECRET_KEY is unset (local dev, e2e, CI), stripeConfigured() is false
// and the checkout path falls back to today's direct-generate behavior.

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!cached) {
    cached = new Stripe(key, {
      // Pin to the SDK's bundled version so behavior is stable across deploys.
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return cached;
}
