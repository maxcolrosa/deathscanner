import { createHmac, timingSafeEqual } from "node:crypto";
import { isCurrency } from "@/lib/money";
import type { Currency } from "@/lib/product";

// Signed win-back tokens. The drip's final email links to a checkout that pays
// the lower `winbackPrice`; the token is an HMAC over the recipient's email +
// currency + expiry, so a visitor cannot mint their own discount or replay an
// expired one. The server always re-derives the amount from the currency in the
// verified token, never from anything the client supplies.

const PURPOSE = "winback";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // links live a week

function secret(): string {
  // A dedicated secret; only matters once real emails send (RESEND configured),
  // at which point WINBACK_SECRET must be set in production.
  return process.env.WINBACK_SECRET || "winback-dev-secret-do-not-use-in-prod";
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export interface WinbackClaim {
  email: string;
  currency: Currency;
}

export function signWinbackToken(email: string, currency: Currency, now = Date.now()): string {
  const exp = now + TTL_MS;
  const payload = `${PURPOSE}:${email.trim().toLowerCase()}:${currency}:${exp}`;
  return `${b64url(payload)}.${sign(payload)}`;
}

// Returns the claim when the token is authentic and unexpired, else null. Uses a
// constant-time comparison and verifies the signature BEFORE trusting any field.
export function verifyWinbackToken(token: string, now = Date.now()): WinbackClaim | null {
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

  const expectedSig = sign(payload);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const [purpose, email, currency, expRaw] = payload.split(":");
  if (purpose !== PURPOSE || !email) return null;
  if (!isCurrency(currency)) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || now > exp) return null;

  return { email, currency };
}
