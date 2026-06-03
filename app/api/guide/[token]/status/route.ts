import { getOrderByToken } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  let order = await getOrderByToken(token);
  if (!order) return Response.json({ error: "not found" }, { status: 404 });
  // Deterministic generation is instant; if it has not run yet, do it now so the
  // result never depends on background job timing.
  if (order.status === "generating") {
    await generateGuide(token);
    order = await getOrderByToken(token);
  }
  return Response.json({ status: order?.status ?? "generating" });
}
