import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { notFound, redirect } from "next/navigation";
import { getOrderByToken } from "@/lib/guide/orders";
import { GuidePdfDocument } from "@/components/guide/guide-pdf";
import { TrackerPackPdfDocument } from "@/components/guide/tracker-pack-pdf";
import { QuickstartPdfDocument } from "@/components/guide/quickstart-pdf";
import { RecipeBookPdfDocument } from "@/components/guide/recipe-book-pdf";
import { ExerciseLibraryPdfDocument } from "@/components/guide/exercise-library-pdf";
import type { GuideDoc } from "@/lib/guide/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Asset = "workbook" | "trackers" | "quickstart" | "recipes" | "exercises";

const ASSET_MAP: Record<
  Asset,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: (props: { guide: GuideDoc }) => any;
    filename: string;
  }
> = {
  workbook: {
    component: GuidePdfDocument,
    filename: "second-wind-protocol.pdf",
  },
  trackers: {
    component: TrackerPackPdfDocument,
    filename: "second-wind-tracker-pack.pdf",
  },
  quickstart: {
    component: QuickstartPdfDocument,
    filename: "second-wind-quick-start.pdf",
  },
  recipes: {
    component: RecipeBookPdfDocument,
    filename: "second-wind-recipe-book.pdf",
  },
  exercises: {
    component: ExerciseLibraryPdfDocument,
    filename: "second-wind-exercise-library.pdf",
  },
};

function isAsset(v: string): v is Asset {
  return (
    v === "workbook" ||
    v === "trackers" ||
    v === "quickstart" ||
    v === "recipes" ||
    v === "exercises"
  );
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string; asset: string }> }
) {
  const { token, asset } = await ctx.params;

  if (!isAsset(asset)) return notFound();

  const order = await getOrderByToken(token);
  if (!order) return notFound();
  if (order.status !== "ready" || !order.guide) redirect(`/guide/${token}`);

  const { component, filename } = ASSET_MAP[asset];

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElement(component, { guide: order.guide }) as any
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
