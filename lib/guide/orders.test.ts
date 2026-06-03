import { describe, it, expect, beforeEach } from "vitest";
import {
  newToken,
  createOrder,
  getOrderByToken,
  markReady,
  markFailed,
  __clearMemory,
} from "@/lib/guide/orders";
import { buildFixtureGuide } from "@/lib/guide/fixture";
import { computeResult } from "@/lib/longevity";

// No Supabase env in the test process -> in-memory backend.
beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  __clearMemory();
});

const answers = { age: 40, smoking: "never", activity: "none", goal: "fat" };

describe("orders store (in-memory)", () => {
  it("newToken returns distinct url-safe tokens", () => {
    const a = newToken();
    const b = newToken();
    expect(a).not.toEqual(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("creates an order in 'generating' and reads it back", async () => {
    const order = await createOrder(answers);
    expect(order.status).toBe("generating");
    const fetched = await getOrderByToken(order.token);
    expect(fetched?.answers).toEqual(answers);
  });

  it("marks an order ready with a guide", async () => {
    const order = await createOrder(answers);
    const guide = buildFixtureGuide(computeResult(answers));
    await markReady(order.token, guide, "stub");
    const fetched = await getOrderByToken(order.token);
    expect(fetched?.status).toBe("ready");
    expect(fetched?.guide?.title).toBe(guide.title);
    expect(fetched?.model).toBe("stub");
  });

  it("marks an order failed with an error", async () => {
    const order = await createOrder(answers);
    await markFailed(order.token, "boom");
    const fetched = await getOrderByToken(order.token);
    expect(fetched?.status).toBe("failed");
    expect(fetched?.error).toBe("boom");
  });

  it("returns null for an unknown token", async () => {
    expect(await getOrderByToken("nope")).toBeNull();
  });
});
