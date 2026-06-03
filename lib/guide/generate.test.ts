import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createOrder, getOrderByToken, __clearMemory } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";
import { buildFixtureGuide } from "@/lib/guide/fixture";
import { computeResult } from "@/lib/longevity";

// Mock only the network wrapper; orders run against the in-memory store.
vi.mock("@/lib/guide/model", () => ({
  GUIDE_MODEL: "claude-sonnet-4-6",
  requestGuide: vi.fn(),
}));
import { requestGuide } from "@/lib/guide/model";

const answers = { age: 50, smoking: "heavy", activity: "none", diet: "poor", goal: "fat" };
const env = { ...process.env };

beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  __clearMemory();
  vi.clearAllMocks();
});
afterEach(() => {
  process.env = { ...env };
});

describe("generateGuide", () => {
  it("uses the offline stub when no API key is set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const order = await createOrder(answers);
    await generateGuide(order.token);
    const done = await getOrderByToken(order.token);
    expect(done?.status).toBe("ready");
    expect(done?.model).toBe("stub");
    expect(done?.guide?.weeks).toHaveLength(8);
    expect(requestGuide).not.toHaveBeenCalled();
  });

  it("calls the model when an API key is present and persists the result", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    delete process.env.GUIDE_STUB;
    (requestGuide as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildFixtureGuide(computeResult(answers))
    );
    const order = await createOrder(answers);
    await generateGuide(order.token);
    const done = await getOrderByToken(order.token);
    expect(requestGuide).toHaveBeenCalledOnce();
    expect(done?.status).toBe("ready");
    expect(done?.model).toBe("claude-sonnet-4-6");
  });

  it("marks the order failed when the model returns an invalid guide", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    delete process.env.GUIDE_STUB;
    (requestGuide as ReturnType<typeof vi.fn>).mockResolvedValue({ not: "a guide" });
    const order = await createOrder(answers);
    await generateGuide(order.token);
    const done = await getOrderByToken(order.token);
    expect(done?.status).toBe("failed");
    expect(done?.error).toBeTruthy();
  });

  it("is a no-op when the order is already ready", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const order = await createOrder(answers);
    await generateGuide(order.token); // -> ready via stub
    await generateGuide(order.token); // second run should not throw or change state
    const done = await getOrderByToken(order.token);
    expect(done?.status).toBe("ready");
  });
});
