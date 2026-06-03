import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { redirect } from "next/navigation";
import { getOrderByToken } from "@/lib/guide/orders";
import { GuidePdfDocument } from "@/components/guide/guide-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const order = await getOrderByToken(token);
  if (!order) return new Response("Not found", { status: 404 });
  if (order.status !== "ready" || !order.guide) redirect(`/guide/${token}`);

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElement(GuidePdfDocument, { guide: order.guide }) as any
  );
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="second-wind-protocol.pdf"',
    },
  });
}
