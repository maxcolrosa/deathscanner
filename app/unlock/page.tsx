import type { Metadata } from "next";
import { UnlockGate } from "@/components/unlock-gate";

// Standalone gate page. The proxy rewrites every un-unlocked request here, so it
// must not itself require the cookie. Keep it out of search indexes.
export const metadata: Metadata = {
  title: "Unlock | Vivrun",
  robots: { index: false, follow: false },
};

export default function UnlockPage() {
  return <UnlockGate />;
}
