import { processDueJobs } from "@/lib/marketing/drip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel Cron target. Vercel sends `Authorization: Bearer ${CRON_SECRET}` when
// CRON_SECRET is configured, so we reject anything else; when it is unset (local
// dev) the route is open so it can be triggered by hand.
export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("unauthorized", { status: 401 });
    }
  }
  const result = await processDueJobs();
  return Response.json({ ok: true, ...result });
}
