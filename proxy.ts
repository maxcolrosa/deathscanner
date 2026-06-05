import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporary site-wide password gate (HTTP Basic Auth).
// Keeps the site off-limits to casual visitors and bots while it is not public.
// Credentials are overridable via env so the password can be rotated without a deploy.
const SITE_USER = process.env.SITE_PASSWORD_USER ?? 'vivrun'
const SITE_PASSWORD = process.env.SITE_PASSWORD ?? 'cocacola!'

function unauthorized() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Restricted", charset="UTF-8"',
    },
  })
}

export function proxy(request: NextRequest) {
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

  return unauthorized()
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
