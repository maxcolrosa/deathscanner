"use server";

import { after } from "next/server";
import { AnswersSchema } from "@/lib/guide/schema";
import { createOrder } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";
import type { Answers } from "@/lib/longevity";

// Entry point for turning a completed scan into a generated guide. Today it is
// called by the buy button; in Phase C the Stripe webhook calls the same path
// after a verified payment.
export async function startGuideGeneration(answers: Answers): Promise<{ token: string }> {
  const parsed = AnswersSchema.parse(answers) as Answers;
  const order = await createOrder(parsed);
  after(async () => {
    await generateGuide(order.token);
  });
  return { token: order.token };
}

// Manual retry from the building screen's failed state. Idempotent.
export async function retryGuideGeneration(token: string): Promise<void> {
  await generateGuide(token);
}
