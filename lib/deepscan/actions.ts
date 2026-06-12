"use server";

// Client-invoked server action: run the AI Deepscan for a purchased order.
// Guards: the order must exist, be fully generated ("ready"), and not already
// carry a deepscan, so each purchase funds exactly one AI run (the cost model
// in lib/product.ts depends on this). Re-running returns the stored record.

import { z } from "zod";
import { getOrderByToken, updateGuide } from "@/lib/guide/orders";
import { validateDeepscanAnswers } from "@/lib/deepscan/questions";
import { runDeepscan } from "@/lib/deepscan/run";
import type { DeepscanRecord } from "@/lib/deepscan/schema";

// Bounded input: this is a public, unauthenticated-beyond-the-token endpoint.
const DeepAnswersSchema = z
  .record(
    z.string().max(40),
    z.union([z.string().max(80), z.array(z.string().max(80)).max(10)])
  )
  .refine((a) => Object.keys(a).length <= 40, { message: "too many answers" });

export type DeepscanActionResult =
  | { ok: true; deepscan: DeepscanRecord }
  | { ok: false; error: string };

export async function runDeepscanAction(
  token: string,
  rawAnswers: Record<string, string | string[]>
): Promise<DeepscanActionResult> {
  if (typeof token !== "string" || token.length === 0 || token.length > 64) {
    return { ok: false, error: "Invalid request." };
  }

  const order = await getOrderByToken(token);
  if (!order || order.status !== "ready" || !order.guide) {
    return { ok: false, error: "Your program is not ready yet. Try again in a moment." };
  }

  // Idempotent: a second submit (double click, refresh replay) returns the
  // existing record instead of paying for another AI run.
  if (order.guide.deepscan) {
    return { ok: true, deepscan: order.guide.deepscan };
  }

  const parsed = DeepAnswersSchema.safeParse(rawAnswers);
  if (!parsed.success || !validateDeepscanAnswers(order.answers, parsed.data)) {
    return { ok: false, error: "Please answer every question before running the Deepscan." };
  }

  const { report, model } = await runDeepscan(order.answers, parsed.data);
  const deepscan: DeepscanRecord = {
    report,
    answers: parsed.data,
    model,
    generatedAt: new Date().toISOString(),
  };

  await updateGuide(token, { ...order.guide, deepscan });
  return { ok: true, deepscan };
}
