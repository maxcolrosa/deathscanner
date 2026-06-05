/**
 * tracker-pack-pdf.tsx
 *
 * Standalone printable tracker pack: workout log, weekly habit grid,
 * 12-week measurement grid, grocery checklist, and daily checklist card.
 *
 * HARD CONSTRAINT: do NOT add `fixed` to any element.
 * @react-pdf 4.x throws "unsupported number" across many auto-broken pages
 * whenever a `fixed` element exists, which 500s the PDF routes.
 */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GuideDoc } from "@/lib/guide/schema";
import {
  SANS,
  MONO,
  C,
  WorkoutLogGrid,
  WeeklyHabitGrid,
  MeasurementTrackerGrid,
  GroceryChecklist,
  DailyChecklistCard,
  TrackerSectionHead,
} from "@/components/guide/pdf-shared";

/* ─── Brand ──────────────────────────────────────────────────────────────────── */
const BRAND = "VIVRUN";

/* ─── StyleSheet ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.fg,
    fontFamily: SANS,
    fontSize: 10.5,
    lineHeight: 1.55,
    paddingVertical: 52,
    paddingHorizontal: 48,
  },
  coverMark: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 48 },
  coverDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent },
  coverMarkText: { fontFamily: MONO, fontSize: 8.5, letterSpacing: 2.2, color: C.fg },
  coverKicker: {
    fontFamily: MONO,
    fontSize: 8.5,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: C.accent,
    marginBottom: 10,
  },
  coverTitle: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 24,
    lineHeight: 1.15,
    letterSpacing: -0.4,
    color: C.fg,
    marginBottom: 10,
    maxWidth: 400,
  },
  coverSub: {
    fontFamily: SANS,
    fontSize: 10.5,
    color: C.muted,
    marginBottom: 20,
    maxWidth: 380,
  },
  rule: { borderBottomWidth: 0.75, borderBottomColor: C.line, marginBottom: 16 },
  sectionBreak: { marginTop: 24 },
});

/* ─── Document ───────────────────────────────────────────────────────────────── */

export function TrackerPackPdfDocument({ guide }: { guide: GuideDoc }) {
  return (
    <Document
      title="Second Wind Protocol - Tracker Pack"
      author={BRAND}
      subject="Printable tracker pack for the Second Wind Protocol"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Cover header ──────────────────────────────────────────────────── */}
        <View style={styles.coverMark}>
          <View style={styles.coverDot} />
          <Text style={styles.coverMarkText}>{BRAND}</Text>
        </View>
        <Text style={styles.coverKicker}>Printable tracker pack</Text>
        <Text style={styles.coverTitle}>Second Wind Protocol Trackers</Text>
        <Text style={styles.coverSub}>
          Print one copy of each tracker per week. Fill in as you go. These
          trackers are personalized to the exercises and habits in your protocol.
        </Text>
        <View style={styles.rule} />

        {/* ── 1. Workout log ───────────────────────────────────────────────── */}
        <TrackerSectionHead title="Workout log" />
        <WorkoutLogGrid guide={guide} />

        {/* ── 2. Weekly habit tracker ──────────────────────────────────────── */}
        <View break style={styles.sectionBreak}>
          <TrackerSectionHead title="Weekly habit tracker" />
          <WeeklyHabitGrid guide={guide} />
        </View>

        {/* ── 3. 12-week measurement tracker ───────────────────────────────── */}
        <View break style={styles.sectionBreak}>
          <TrackerSectionHead title="12-week measurement tracker" />
          <MeasurementTrackerGrid />
        </View>

        {/* ── 4. Grocery checklist ─────────────────────────────────────────── */}
        <View break style={styles.sectionBreak}>
          <TrackerSectionHead title="Grocery checklist" />
          <GroceryChecklist aisles={guide.trackers.groceryByAisle} />
        </View>

        {/* ── 5. Daily checklist ───────────────────────────────────────────── */}
        <View break style={styles.sectionBreak}>
          <TrackerSectionHead title="Daily checklist card" />
          <DailyChecklistCard items={guide.trackers.dailyChecklist} />
        </View>
      </Page>
    </Document>
  );
}
