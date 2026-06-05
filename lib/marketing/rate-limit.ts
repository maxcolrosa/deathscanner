// In-process fixed-window rate limiter, plus a durable Supabase-backed variant
// (rateLimitDurable). Prefer the durable one for anything that must actually
// hold on Vercel: the in-process map below resets per serverless instance, so
// on its own it only blunts casual abuse in a single instance / local dev.

declare const globalThis: {
  __rateBuckets?: Map<string, { count: number; reset: number }>;
};
if (!globalThis.__rateBuckets) {
  globalThis.__rateBuckets = new Map();
}
const buckets = globalThis.__rateBuckets;

// Returns true if the action is allowed, false if the window's budget is spent.
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export function __clearRateBuckets(): void {
  buckets.clear();
}

// Durable, cross-instance rate limit backed by the public.rate_limit_hit
// Postgres function (atomic check-and-increment). Falls back to the in-process
// limiter above when Supabase is not configured (local dev, tests, e2e) or if
// the RPC errors, so a transient DB hiccup still leaves per-instance protection
// in place rather than failing fully open. Returns true if allowed.
export async function rateLimitDurable(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return rateLimit(key, max, windowMs);
  }
  try {
    const { supabaseServer } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseServer().rpc("rate_limit_hit", {
      p_key: key,
      p_max: max,
      p_window_ms: windowMs,
    });
    if (error) throw new Error(error.message);
    return data === true;
  } catch (err) {
    console.error("[rate-limit] durable check failed, falling back:", err);
    return rateLimit(key, max, windowMs);
  }
}
