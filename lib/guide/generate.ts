import { computeResult } from "@/lib/longevity";
import { getOrderByToken, markReady, markFailed } from "@/lib/guide/orders";
import { buildGuide } from "@/lib/guide/build-guide";

const GUIDE_MODEL = "deterministic-v1";

// Deterministic, offline guide generation: no network, no AI call. Instant, and
// it cannot fail on content. Idempotent: no-op once an order is ready.
export async function generateGuide(token: string): Promise<void> {
  const order = await getOrderByToken(token);
  if (!order || order.status === "ready") return;
  try {
    const guide = buildGuide(computeResult(order.answers), order.answers);
    await markReady(token, guide, GUIDE_MODEL);
  } catch (e) {
    await markFailed(token, e instanceof Error ? e.message : String(e));
  }
}
