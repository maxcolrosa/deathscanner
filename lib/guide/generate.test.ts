import { describe, it, expect, beforeEach } from "vitest";
import { createOrder, getOrderByToken, __clearMemory } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";

beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  __clearMemory();
});

const answers = { age: 50, smoking: "heavy", activity: "none", diet: "poor", goal: "fat" };

describe("generateGuide", () => {
  it("deterministically builds and stores a valid guide", async () => {
    const order = await createOrder(answers);
    await generateGuide(order.token);
    const done = await getOrderByToken(order.token);
    expect(done?.status).toBe("ready");
    expect(done?.guide?.weeks).toHaveLength(8);
    expect(done?.model).toBe("deterministic-v1");
  });

  it("is idempotent once ready", async () => {
    const order = await createOrder(answers);
    await generateGuide(order.token);
    await generateGuide(order.token);
    expect((await getOrderByToken(order.token))?.status).toBe("ready");
  });

  it("no-ops for an unknown token", async () => {
    await expect(generateGuide("nope")).resolves.toBeUndefined();
  });
});
