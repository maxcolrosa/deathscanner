import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  rateLimit,
  rateLimitDurable,
  __clearRateBuckets,
} from "@/lib/marketing/rate-limit";

// No Supabase env in the test process -> durable limiter falls back to the
// in-process limiter, which is what these assertions exercise.
beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  __clearRateBuckets();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit (in-process fixed window)", () => {
  it("allows up to max within the window, then blocks", () => {
    const key = "k";
    expect(rateLimit(key, 3, 1000)).toBe(true);
    expect(rateLimit(key, 3, 1000)).toBe(true);
    expect(rateLimit(key, 3, 1000)).toBe(true);
    expect(rateLimit(key, 3, 1000)).toBe(false);
  });

  it("keeps separate budgets per key", () => {
    expect(rateLimit("a", 1, 1000)).toBe(true);
    expect(rateLimit("a", 1, 1000)).toBe(false);
    expect(rateLimit("b", 1, 1000)).toBe(true);
  });

  it("resets once the window elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    expect(rateLimit("k", 1, 1000)).toBe(true);
    expect(rateLimit("k", 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit("k", 1, 1000)).toBe(true);
  });
});

describe("rateLimitDurable (falls back without Supabase)", () => {
  it("enforces the cap via the in-process limiter", async () => {
    expect(await rateLimitDurable("e", 2, 1000)).toBe(true);
    expect(await rateLimitDurable("e", 2, 1000)).toBe(true);
    expect(await rateLimitDurable("e", 2, 1000)).toBe(false);
  });
});
