import { computeResult, type Answers } from "@/lib/longevity";
import { GuideDocSchema, type GuideDoc } from "@/lib/guide/schema";
import { buildGuidePrompt } from "@/lib/guide/prompt";
import { buildFixtureGuide } from "@/lib/guide/fixture";
import { getOrderByToken, markReady, markFailed } from "@/lib/guide/orders";
import { requestGuide, GUIDE_MODEL } from "@/lib/guide/model";

function stubEnabled(): boolean {
  return !process.env.ANTHROPIC_API_KEY || process.env.GUIDE_STUB === "1";
}

async function produceGuide(answers: Answers): Promise<{ guide: GuideDoc; model: string }> {
  const result = computeResult(answers);
  if (stubEnabled()) {
    return { guide: buildFixtureGuide(result), model: "stub" };
  }
  const { system, user } = buildGuidePrompt(result, answers);
  let lastError: unknown;
  // One repair retry: a transient bad response (invalid JSON) gets a second chance.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await requestGuide(system, user);
      return { guide: GuideDocSchema.parse(raw), model: GUIDE_MODEL };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

// Idempotent: safe to call again on a failed or stuck order; no-op once ready.
export async function generateGuide(token: string): Promise<void> {
  const order = await getOrderByToken(token);
  if (!order || order.status === "ready") return;
  try {
    const { guide, model } = await produceGuide(order.answers);
    await markReady(token, guide, model);
  } catch (e) {
    await markFailed(token, e instanceof Error ? e.message : String(e));
  }
}
