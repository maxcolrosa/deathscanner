import { headers } from "next/headers";
import { ScanFlow } from "./scan-flow";
import { resolveCurrency } from "@/lib/money";

// Server shell: resolve the visitor's currency from the Vercel geo header (Next
// 16 removed request.geo), with a `?cur=` override for testing, then hand it to
// the client state machine. Dynamic so the geo header is read per request.
export const dynamic = "force-dynamic";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ cur?: string | string[] }>;
}) {
  const h = await headers();
  const sp = await searchParams;
  const currency = resolveCurrency(h.get("x-vercel-ip-country"), sp?.cur);
  return <ScanFlow currency={currency} />;
}
