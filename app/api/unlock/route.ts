import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimitDurable } from "@/lib/marketing/rate-limit";
import {
  SITE_PASSWORD,
  UNLOCK_COOKIE,
  safeEqual,
  unlockToken,
} from "@/lib/site-gate";

// Verifies the site password and, on success, issues the unlock cookie the
// proxy checks. This is the one route that lets a visitor past the gate, so it
// is unauthenticated by necessity and bounds abuse with a durable per-IP rate
// limit (the password is a single shared secret, so brute force is the threat).
export async function POST(request: Request) {
  // Fail closed: no configured password means no way in.
  if (!SITE_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0].trim() ||
    "unknown";
  // 10 attempts / 10 min per IP. Generous for a fat-fingered human, hostile to
  // an automated guesser. Over-cap returns 429 without revealing correctness.
  const allowed = await rateLimitDurable(`unlock:${ip}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // Cap input so a giant body cannot be used to burn CPU on the HMAC.
  if (password.length > 256) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Constant-time via HMAC: hashing both sides to fixed length first means
  // neither the password length nor its contents leak through timing.
  const [given, expected] = await Promise.all([
    unlockToken(password),
    unlockToken(SITE_PASSWORD),
  ]);
  if (!safeEqual(given, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(UNLOCK_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
