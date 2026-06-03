import { notFound } from "next/navigation";
import { after } from "next/server";
import { getOrderByToken, type OrderRow } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";

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
    // Replaced by <GuideView /> in Task 11.
    return <pre>{JSON.stringify(order.guide, null, 2)}</pre>;
  }

  // Auto-retry a failed or stuck generation in the background (idempotent).
  if (order.status === "failed" || isStale(order)) {
    after(async () => {
      await generateGuide(token);
    });
  }

  // Replaced by <GuideBuildingScreen /> in Task 11.
  return <p>Building your protocol...</p>;
}
