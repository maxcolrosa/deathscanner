import { describe, it, expect, beforeEach } from "vitest";
import {
  newToken,
  createOrder,
  getOrderByToken,
  markReady,
  markFailed,
  markPaid,
  markEmailed,
  __clearMemory,
} from "@/lib/guide/orders";
import { buildGuide } from "@/lib/guide/build-guide";
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
    const guide = buildGuide(computeResult(answers), answers);
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

describe("markPaid (Stripe fulfillment)", () => {
  it("flips an awaiting_payment order to generating exactly once", async () => {
    const order = await createOrder(answers, "awaiting_payment");
    expect(order.status).toBe("awaiting_payment");

    const first = await markPaid(order.token, { sessionId: "cs_1", email: "a@b.com" });
    expect(first).toBe(true);

    const paid = await getOrderByToken(order.token);
    expect(paid?.status).toBe("generating");
    expect(paid?.stripe_session_id).toBe("cs_1");
    expect(paid?.customer_email).toBe("a@b.com");
    expect(paid?.paid_at).toBeTruthy();

    // Webhook retry / success-page race: second call is a no-op.
    const second = await markPaid(order.token, { sessionId: "cs_2", email: "x@y.com" });
    expect(second).toBe(false);
    const after = await getOrderByToken(order.token);
    expect(after?.stripe_session_id).toBe("cs_1");
  });

  it("never pays an order that was not awaiting payment", async () => {
    const order = await createOrder(answers); // 'generating'
    expect(await markPaid(order.token, { sessionId: "cs_3", email: null })).toBe(false);
  });

  it("markEmailed records the delivery timestamp", async () => {
    const order = await createOrder(answers, "awaiting_payment");
    await markPaid(order.token, { sessionId: "cs_4", email: "c@d.com" });
    await markEmailed(order.token);
    expect((await getOrderByToken(order.token))?.emailed_at).toBeTruthy();
  });
});
