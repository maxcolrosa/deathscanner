"use server";

import { AnswersSchema } from "@/lib/guide/schema";
import { createOrder } from "@/lib/guide/orders";
import { startGuideGeneration } from "@/lib/guide/start";
import { getStripe, stripeConfigured } from "@/lib/stripe/server";
import { siteUrl } from "@/lib/email/send";
import { PRODUCT, chargeAmountMinor, type Currency } from "@/lib/product";
import { isCurrency } from "@/lib/money";
import type { Answers } from "@/lib/longevity";

export type CheckoutResult = { url: string } | { token: string };

export interface CheckoutOptions {
  /** From useSale(): the on-page countdown has expired, so charge the higher price. */
  expired?: boolean;
  /** From useSale(): the visitor's resolved currency. */
  currency?: string;
}

export async function beginCheckout(
  answers: Answers,
  opts: CheckoutOptions = {}
): Promise<CheckoutResult> {
  const parsed = AnswersSchema.parse(answers) as Answers;
  const upper = opts.currency?.toUpperCase();
  const currency: Currency = isCurrency(upper) ? upper : "USD";
  const expired = Boolean(opts.expired);

  // No Stripe configured: keep today's direct-generate path (dev, e2e, CI).
  if (!stripeConfigured()) {
    return startGuideGeneration(parsed);
  }

  // Store the answers in a pending order BEFORE redirect, so order contents can
  // never be altered through the client and there is no Stripe metadata limit.
  const order = await createOrder(parsed, "awaiting_payment");
  const stripe = getStripe();
  const base = siteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: chargeAmountMinor(currency, expired),
          product_data: {
            name: PRODUCT.name,
            description: PRODUCT.tagline,
          },
        },
      },
    ],
    client_reference_id: order.token,
    success_url: `${base}/guide/${order.token}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/scan`,
  });

  if (!session.url) throw new Error("Stripe Checkout Session returned no URL");
  return { url: session.url };
}
