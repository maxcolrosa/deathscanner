import { getOrderByToken } from "@/lib/guide/orders";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const order = await getOrderByToken(token);
  if (!order) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ status: order.status });
}
