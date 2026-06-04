/**
 * pdf-render.test.ts
 *
 * Smoke tests that renderToBuffer each PDF document (workbook, tracker pack,
 * quick-start) for multiple fixture profiles. These tests serve as the primary
 * regression guard against the @react-pdf/renderer "unsupported number" error
 * caused by `fixed` elements.
 *
 * If any document throws during rendering, the test fails -- giving early
 * warning before a broken PDF reaches the download route.
 */
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { computeResult } from "@/lib/longevity";
import { buildGuide } from "@/lib/guide/build-guide";
import { GuidePdfDocument } from "@/components/guide/guide-pdf";
import { TrackerPackPdfDocument } from "@/components/guide/tracker-pack-pdf";
import { QuickstartPdfDocument } from "@/components/guide/quickstart-pdf";
import { RecipeBookPdfDocument } from "@/components/guide/recipe-book-pdf";
import { ExerciseLibraryPdfDocument } from "@/components/guide/exercise-library-pdf";

/* ─── Fixtures (mirrored from build-guide.test.ts) ───────────────────────────── */
const sedentary = {
  age: 45, sex: "male", smoking: "heavy", bodycomp: "over",
  activity: "none", activity_barrier: "time", diet: "poor",
  alcohol: "moderate", sleep: "low", stress: "high",
  genetics: "mixed", goal: "fat",
};
const active = {
  age: 30, sex: "female", smoking: "never", bodycomp: "lean",
  activity: "high", diet: "excellent", alcohol: "none",
  sleep: "optimal", stress: "low", genetics: "strong", goal: "strength",
};

/* ─── Helper ─────────────────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderDoc(component: (props: { guide: ReturnType<typeof buildGuide> }) => any, guide: ReturnType<typeof buildGuide>): Promise<Buffer> {
  return renderToBuffer(createElement(component, { guide }) as never);
}

/* ─── Tests ──────────────────────────────────────────────────────────────────── */
describe("PDF render smoke tests (no-fixed guard)", () => {
  for (const [label, answers] of [
    ["sedentary", sedentary],
    ["active", active],
  ] as const) {
    const guide = buildGuide(computeResult(answers), answers);

    it(`GuidePdfDocument renders for ${label} profile`, async () => {
      const buf = await renderDoc(GuidePdfDocument, guide);
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.length).toBeGreaterThan(0);
    });

    it(`TrackerPackPdfDocument renders for ${label} profile`, async () => {
      const buf = await renderDoc(TrackerPackPdfDocument, guide);
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.length).toBeGreaterThan(0);
    });

    it(`QuickstartPdfDocument renders for ${label} profile`, async () => {
      const buf = await renderDoc(QuickstartPdfDocument, guide);
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.length).toBeGreaterThan(0);
    });

    it(`RecipeBookPdfDocument renders for ${label} profile`, async () => {
      const buf = await renderDoc(RecipeBookPdfDocument, guide);
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.length).toBeGreaterThan(0);
    });

    it(`ExerciseLibraryPdfDocument renders for ${label} profile`, async () => {
      const buf = await renderDoc(ExerciseLibraryPdfDocument, guide);
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.length).toBeGreaterThan(0);
    });
  }
});
