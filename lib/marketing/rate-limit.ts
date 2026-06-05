// Best-effort in-process fixed-window rate limiter. It is NOT durable across
// serverless instances, so it is defense-in-depth, not a hard guarantee; a
// pre-launch hardening item is a shared store (Upstash / Supabase) plus a
// CAPTCHA on the capture form. Good enough to blunt casual abuse of the public
// capture endpoint in a single instance / local dev.

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
