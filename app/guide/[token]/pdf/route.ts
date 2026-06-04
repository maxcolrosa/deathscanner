import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Legacy PDF route. Redirects to the unified download route so there is one
 * source of truth for rendering. Existing bookmark/share links continue to work.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  redirect(`/guide/${token}/download/workbook`);
}
