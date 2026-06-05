import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporary site-wide password gate (HTTP Basic Auth).
// Keeps the site off-limits to casual visitors and bots while it is not public.
//
// Credentials come from env ONLY (SITE_PASSWORD_USER / SITE_PASSWORD) so the
// password is never committed. Set them in `.env.local` for local dev and in the
// Vercel project's Environment Variables for deployments. If either is unset the
// gate fails CLOSED: every matched route is denied until they are configured.
const SITE_USER = process.env.SITE_PASSWORD_USER
const SITE_PASSWORD = process.env.SITE_PASSWORD

function unauthorized(message: string, prompt: boolean) {
  return new NextResponse(message, {
    status: 401,
    headers: prompt
      ? { 'WWW-Authenticate': 'Basic realm="Restricted", charset="UTF-8"' }
      : undefined,
  })
}

export function proxy(request: NextRequest) {
  // Fail closed: with no configured credentials, nothing gets through.
  if (!SITE_USER || !SITE_PASSWORD) {
    return unauthorized('Access is not configured.', false)
  }

  const header = request.headers.get('authorization')

  if (header?.startsWith('Basic ')) {
    const decoded = atob(header.slice(6))
    const sep = decoded.indexOf(':')
    const user = decoded.slice(0, sep)
    const pass = decoded.slice(sep + 1)
    if (user === SITE_USER && pass === SITE_PASSWORD) {
      return NextResponse.next()
    }
  }

  return unauthorized('Authentication required.', true)
}

export const config = {
  // Gate every route except:
  // - /api (machine-to-machine callers: Stripe webhook, Vercel cron, signed token routes,
  //   each with its own auth; they cannot answer a Basic Auth prompt)
  // - Next.js internals and static metadata files
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
