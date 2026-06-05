import "server-only";
import { Resend } from "resend";
import { PRODUCT } from "@/lib/product";
import {
  renderReportEmail,
  type ReportEmailData,
} from "@/emails/report-email";

// Thin Resend wrapper. Email is best-effort and never blocks fulfillment: when
// RESEND_API_KEY / EMAIL_FROM are unset (local dev, CI), sends are a logged
// no-op so the guide is still delivered via the success redirect.

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.log(
      `[email] no-op (RESEND not configured): "${opts.subject}" -> ${opts.to}`
    );
    return false;
  }
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error("[email] send failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send threw:", err);
    return false;
  }
}

// Transactional "your program is ready" email sent after a verified payment. A
// plain, on-brand dark email with an absolute link so the buyer can return
// later (the tokenized URL is the access mechanism).
export async function sendGuideEmail(to: string, token: string): Promise<boolean> {
  const link = `${siteUrl()}/guide/${token}`;
  const html = `
  <div style="margin:0;padding:24px;background:#0a0e12;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#e8eef2;">
    <div style="max-width:520px;margin:0 auto;background:#10151b;border:1px solid #1d2630;border-radius:12px;padding:32px;">
      <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#2ee6c9;">Payment confirmed</div>
      <h1 style="margin:8px 0 16px;font-size:24px;line-height:1.2;color:#e8eef2;">Your ${PRODUCT.name} is ready</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#9fb0bd;">
        Everything is built from your scan and waiting for you: your 90-day program, the full kit, and all five downloads. Open it any time with the link below. It is yours to keep.
      </p>
      <a href="${link}" style="display:inline-block;background:#2ee6c9;color:#0a0e12;font-weight:600;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:8px;">Open your program</a>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6b7a87;word-break:break-all;">
        Or paste this into your browser:<br/>${link}
      </p>
    </div>
  </div>`;
  return sendEmail({
    to,
    subject: `Your ${PRODUCT.name} is ready`,
    html,
  });
}

// The free, instant "here is your scan result" email captured at the email gate.
// This is the service email the user explicitly asked for, so it sends regardless
// of marketing consent. It renders the on-brand ReportEmail to HTML.
export async function sendReportEmail(
  to: string,
  data: ReportEmailData
): Promise<boolean> {
  const html = await renderReportEmail(data);
  return sendEmail({
    to,
    subject: "Your longevity scan result is ready",
    html,
  });
}
