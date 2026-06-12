import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getOrderByToken, type OrderRow } from "@/lib/guide/orders";
import { generateGuide } from "@/lib/guide/generate";
import { verifyCheckoutSession } from "@/lib/guide/fulfill";
import { stripeConfigured } from "@/lib/stripe/server";
import { GuideBuildingScreen } from "@/components/guide/guide-building-screen";
import { GuideView } from "@/components/guide/guide-view";
import { getDeepscanQuestions } from "@/lib/deepscan/questions";

export const dynamic = "force-dynamic";

function isStale(order: OrderRow): boolean {
  return Date.now() - new Date(order.created_at).getTime() > 90_000;
}

// Shown when an order is awaiting payment and we cannot confirm it was paid
// (abandoned checkout, or the success redirect lacked a paid session). Never
// exposes the guide.
function PaymentPending() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-alert">
        Payment not completed
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-monitor-fg">
        We have not received your payment yet
      </h1>
      <p className="text-sm leading-relaxed text-monitor-muted">
        If you closed the checkout before paying, your program was not built. You
        can run your scan again and grab your launch price while it is still
        active.
      </p>
      <Link
        href="/scan"
        className="rounded-md bg-monitor-accent px-6 py-2.5 text-sm font-semibold text-monitor-bg transition-colors hover:bg-monitor-accent/90"
      >
        Back to my offer
      </Link>
    </main>
  );
}

export default async function GuideTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  if (order.status === "ready" && order.guide) {
    return (
      <GuideView
        guide={order.guide}
        token={token}
        deepscanQuestions={getDeepscanQuestions(order.answers)}
      />
    );
  }

  // Payment pending: verify the Stripe session inline (covers webhook latency
  // and local dev without the CLI). Only a paid order moves on to the build.
  if (order.status === "awaiting_payment") {
    const sessionId = typeof sp?.session_id === "string" ? sp.session_id : undefined;
    if (sessionId && stripeConfigured()) {
      const paid = await verifyCheckoutSession(token, sessionId);
      if (paid) {
        return <GuideBuildingScreen token={token} failed={false} />;
      }
    }
    return <PaymentPending />;
  }

  // Auto-retry only orphaned/stuck generations in the background (idempotent).
  if (order.status === "generating" && isStale(order)) {
    after(async () => {
      await generateGuide(token);
    });
  }

  return <GuideBuildingScreen token={token} failed={order.status === "failed"} />;
}
