import { createHmac, timingSafeEqual } from "node:crypto";
import { isCurrency } from "@/lib/money";
import type { Currency } from "@/lib/product";

// Signed links embedded in the emails we send. Two purposes:
//   - "result": re-open the recipient's saved scan result (email + currency).
//   - "unsub":  one-click unsubscribe (email only).
// Each token is an HMAC over purpose + fields + expiry, mirroring
// lib/marketing/winback.ts, so a recipient cannot mint or tamper with one and
// the server re-derives every field from the verified token rather than trusting
// anything the client supplies.

const RESULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // result links live a week
const UNSUB_TTL_MS = 365 * 24 * 60 * 60 * 1000; // unsubscribe stays valid ~a year

function secret(): string {
  // A dedicated secret, falling back to the win-back secret so production only
  // has to configure one signing key. Matters once real emails send.
  return (
    process.env.EMAIL_LINK_SECRET ||
    process.env.WINBACK_SECRET ||
    "email-link-dev-secret-do-not-use-in-prod"
  );
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function makeToken(payload: string): string {
  return `${b64url(payload)}.${sign(payload)}`;
}

// Verify the signature and return the raw payload, or null when the token is
// malformed or forged. Constant-time signature comparison; the signature is
// checked BEFORE any field is trusted.
function openToken(token: string): string | null {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payloadB64 = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString();
  } catch {
    return null;
  }

  const a = Buffer.from(providedSig);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export interface ResultClaim {
  email: string;
  currency: Currency;
}

export function signResultToken(
  email: string,
  currency: Currency,
  now = Date.now()
): string {
  const exp = now + RESULT_TTL_MS;
  return makeToken(`result:${email.trim().toLowerCase()}:${currency}:${exp}`);
}

export function verifyResultToken(
  token: string,
  now = Date.now()
): ResultClaim | null {
  const payload = openToken(token);
  if (!payload) return null;
  const [purpose, email, currency, expRaw] = payload.split(":");
  if (purpose !== "result" || !email) return null;
  if (!isCurrency(currency)) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || now > exp) return null;
  return { email, currency };
}

export function signUnsubscribeToken(email: string, now = Date.now()): string {
  const exp = now + UNSUB_TTL_MS;
  return makeToken(`unsub:${email.trim().toLowerCase()}:${exp}`);
}

// Returns the unsubscribing email when authentic and unexpired, else null.
export function verifyUnsubscribeToken(
  token: string,
  now = Date.now()
): string | null {
  const payload = openToken(token);
  if (!payload) return null;
  const [purpose, email, expRaw] = payload.split(":");
  if (purpose !== "unsub" || !email) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || now > exp) return null;
  return email;
}
