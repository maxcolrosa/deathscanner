import { verifyUnsubscribeToken } from "@/lib/marketing/email-links";
import { markUnsubscribed } from "@/lib/marketing/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-click unsubscribe target for the marketing emails. The token is a signed
// HMAC over the recipient's email (lib/marketing/email-links.ts), so the link
// cannot be forged and we never expose the address. Handles both the human GET
// (renders a confirmation page) and the RFC 8058 one-click POST that mail
// clients fire. Idempotent: unsubscribing an already-unsubscribed address is a
// no-op. Lives under /api so the site password gate does not block recipients.

const PAGE_CSS = `
  :root { color-scheme: dark; }
  body { margin:0; min-height:100dvh; display:flex; align-items:center; justify-content:center;
    background:#070b0d; color:#d7e3e6;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
  .card { max-width:440px; margin:24px; padding:36px; background:#0c1418;
    border:1px solid #16242b; border-radius:14px; text-align:center; }
  .tag { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:11px;
    letter-spacing:0.18em; text-transform:uppercase; color:#2ee6c9; margin:0 0 12px; }
  h1 { font-size:22px; line-height:1.25; font-weight:600; margin:0 0 12px; }
  p { font-size:14px; line-height:1.6; color:#6b8088; margin:0; }
`;

function page(tag: string, heading: string, body: string, status = 200): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>${heading}</title><style>${PAGE_CSS}</style></head>
<body><main class="card"><p class="tag">${tag}</p><h1>${heading}</h1><p>${body}</p></main></body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function unsubscribe(token: string): Promise<Response> {
  const email = verifyUnsubscribeToken(token);
  if (!email) {
    return page(
      "Link expired",
      "This link is no longer valid",
      "The unsubscribe link is invalid or has expired. If you keep getting emails, reply to one and we will remove you.",
      400
    );
  }
  try {
    await markUnsubscribed(email);
  } catch (err) {
    console.error("[unsubscribe] failed:", err);
    return page(
      "Something went wrong",
      "We could not finish that",
      "Please try the link again in a moment. If it keeps failing, reply to any email and we will take care of it.",
      500
    );
  }
  return page(
    "Unsubscribed",
    "You are off the list",
    "You will not get any more tips or offers from Vivrun. Any report you asked for will still arrive."
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {
  const { token } = await params;
  return unsubscribe(token);
}

// RFC 8058 one-click POST fired by Gmail/Apple Mail's native unsubscribe button.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {
  const { token } = await params;
  return unsubscribe(token);
}
