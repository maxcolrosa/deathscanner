// Shared logic for the site-wide password gate. Imported by both the proxy
// (which verifies the unlock cookie on every request) and the /api/unlock route
// (which issues it on a correct password). Keeping the token derivation in one
// place means the two sides can never drift.
//
// The password comes from env ONLY (SITE_PASSWORD) so it is never committed.
// Set it in `.env.local` for local dev and in the Vercel project's Environment
// Variables for deployments. If it is unset the gate fails CLOSED.

export const UNLOCK_COOKIE = "sw_unlock";

// The cookie holds an HMAC of a fixed message keyed by the site password.
// Because the password is the HMAC key, the token cannot be forged without it,
// and (being one-way) the token never leaks the password itself. The value is
// the same for every visitor: this is a shared gate, not a per-user session.
const UNLOCK_MESSAGE = "vivrun-site-unlock-v1";

export const SITE_PASSWORD = process.env.SITE_PASSWORD;

// HMAC-SHA256(key = password, msg = UNLOCK_MESSAGE), hex-encoded. Uses Web
// Crypto so it runs identically under the Edge runtime that backs the proxy and
// the Node runtime that backs the API route.
export async function unlockToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(UNLOCK_MESSAGE));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time compare of two equal-purpose hex strings. Both sides here are
// fixed-length 64-char HMAC digests, so the early length check leaks nothing
// secret (the token length is public); it only rejects malformed cookies fast.
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
