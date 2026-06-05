import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SITE_PASSWORD,
  UNLOCK_COOKIE,
  safeEqual,
  unlockToken,
} from "@/lib/site-gate";

// Temporary site-wide password gate (on-site unlock page, not browser Basic
// Auth). Keeps the site off-limits to casual visitors and bots while it is not
// public. A visitor without a valid unlock cookie sees the /unlock page; on the
// correct password the /api/unlock route sets the cookie and they are let in.

export async function proxy(request: NextRequest) {
  // Fail closed: with no configured password, nothing gets through.
  if (!SITE_PASSWORD) {
    return new NextResponse("Access is not configured.", { status: 503 });
  }

  const cookie = request.cookies.get(UNLOCK_COOKIE)?.value;
  if (cookie) {
    const expected = await unlockToken(SITE_PASSWORD);
    if (safeEqual(cookie, expected)) {
      return NextResponse.next();
    }
  }

  // Not unlocked: render the unlock page in place of whatever was requested.
  // A rewrite (not a redirect) keeps the original URL, so once the visitor
  // unlocks, a reload lands them exactly where they were headed.
  return NextResponse.rewrite(new URL("/unlock", request.url));
}

export const config = {
  // Gate every route except:
  // - /api (machine-to-machine callers: Stripe webhook, Vercel cron, signed token
  //   routes, and the /api/unlock verifier itself, each with its own auth)
  // - Next.js internals and static metadata files
  matcher: [
    "/((?!api(?:/|$)|_next/static/|_next/image/|favicon\\.ico$|sitemap\\.xml$|robots\\.txt$).*)",
  ],
};
