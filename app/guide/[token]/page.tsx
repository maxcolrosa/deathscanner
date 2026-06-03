import { notFound } from "next/navigation";
import { after } from "next/server";
import { getOrderByToken, type OrderRow } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";
import { GuideBuildingScreen } from "@/components/guide/guide-building-screen";
import { GuideView } from "@/components/guide/guide-view";

export const dynamic = "force-dynamic";

function isStale(order: OrderRow): boolean {
  return Date.now() - new Date(order.created_at).getTime() > 90_000;
}

export default async function GuideTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  if (order.status === "ready" && order.guide) {
    return <GuideView guide={order.guide} token={token} />;
  }

  // Auto-retry a failed or stuck generation in the background (idempotent).
  if (order.status === "failed" || isStale(order)) {
    after(async () => {
      await generateGuide(token);
    });
  }

  return <GuideBuildingScreen token={token} failed={order.status === "failed"} />;
}
