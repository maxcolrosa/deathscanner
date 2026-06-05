/**
 * quickstart-pdf.tsx
 *
 * One-page "start today" quick-start card: first 7 days, 10-minute plan,
 * daily checklist, and top 3 numbers metrics.
 *
 * HARD CONSTRAINT: do NOT add `fixed` to any element.
 * @react-pdf 4.x throws "unsupported number" across many auto-broken pages
 * whenever a `fixed` element exists, which 500s the PDF routes.
 */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { GuideDoc } from "@/lib/guide/schema";
import { SANS, MONO, C, trackerStyles } from "@/components/guide/pdf-shared";

/* ─── Brand ──────────────────────────────────────────────────────────────────── */
const BRAND = "VIVRUN";

/* ─── StyleSheet ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.fg,
    fontFamily: SANS,
    fontSize: 10,
    lineHeight: 1.5,
    paddingVertical: 40,
    paddingHorizontal: 44,
  },

  /* Page header */
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 18 },
  headerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent },
  headerBrand: { fontFamily: MONO, fontSize: 7.5, letterSpacing: 2, color: C.muted },
  headerTitle: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 20,
    lineHeight: 1.15,
    color: C.fg,
    marginBottom: 6,
  },
  headerSub: { fontFamily: MONO, fontSize: 8, color: C.muted, marginBottom: 16 },
  rule: { borderBottomWidth: 0.75, borderBottomColor: C.line, marginBottom: 14 },

  /* Two-column layout */
  columns: { flexDirection: "row", gap: 18 },
  colLeft: { flex: 1 },
  colRight: { flex: 1 },

  /* Section label */
  sectionLabel: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: C.accent,
    marginBottom: 6,
    marginTop: 14,
  },

  /* First 7 days list */
  dayRow: { flexDirection: "row", marginBottom: 4 },
  dayNum: { fontFamily: MONO, fontSize: 8.5, color: C.accentDim, width: 18 },
  dayName: { fontFamily: SANS, fontWeight: 600, fontSize: 9, color: C.accent },
  dayAction: { fontFamily: SANS, fontSize: 9, color: C.fg, flex: 1 },

  /* 10-minute plan */
  movementRow: { flexDirection: "row", marginBottom: 4 },
  movementMark: { fontFamily: MONO, fontSize: 9, color: C.accent, width: 12 },
  movementText: { fontFamily: SANS, fontSize: 9, color: C.fg, flex: 1 },
  movementDetail: { fontFamily: SANS, fontSize: 8.5, color: C.muted, flex: 1 },

  /* Metrics mini-table */
  metricRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
    paddingVertical: 4,
  },
  metricLabel: { fontFamily: SANS, fontWeight: 600, fontSize: 8.5, color: C.fg, flex: 2 },
  metricBand: { fontFamily: MONO, fontSize: 8, color: C.muted, flex: 2 },
  metricTarget: { fontFamily: MONO, fontSize: 8, color: C.accent, flex: 2 },

  /* 10-minute plan summary */
  planSummary: { fontFamily: SANS, fontSize: 8.5, color: C.muted, marginBottom: 6 },

  /* Metrics note and header row */
  metricsNote: { fontFamily: MONO, fontSize: 7.5, color: C.muted, marginBottom: 6 },
  metricsHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: C.accentDim,
    paddingBottom: 3,
    marginBottom: 2,
  },

  /* Footer note */
  footerNote: {
    fontFamily: MONO,
    fontSize: 7.5,
    color: C.muted,
    marginTop: 18,
    textAlign: "center",
  },
});

/* ─── Document ───────────────────────────────────────────────────────────────── */

export function QuickstartPdfDocument({ guide }: { guide: GuideDoc }) {
  const top3Metrics = guide.yourNumbers.metrics.slice(0, 3);

  return (
    <Document
      title="Second Wind Protocol - Quick Start"
      author={BRAND}
      subject="Start today: your Second Wind Protocol quick-start card"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.headerDot} />
          <Text style={styles.headerBrand}>{BRAND}</Text>
        </View>
        <Text style={styles.headerTitle}>Start Today</Text>
        <Text style={styles.headerSub}>
          Your quick-start card for the Second Wind Protocol. Pin this somewhere visible.
        </Text>
        <View style={styles.rule} />

        {/* ── Two-column body ───────────────────────────────────────────────── */}
        <View style={styles.columns}>
          {/* Left: first 7 days + 10-minute plan */}
          <View style={styles.colLeft}>
            <Text style={styles.sectionLabel}>Your first 7 days</Text>
            {guide.next7Days.map((d, i) => (
              <View key={i} style={styles.dayRow} wrap={false}>
                <Text style={styles.dayNum}>{String(i + 1)}</Text>
                <Text style={styles.dayAction}>
                  <Text style={styles.dayName}>{d.day}. </Text>
                  {d.action}
                </Text>
              </View>
            ))}

            <Text style={styles.sectionLabel}>The 10-minute fallback</Text>
            <Text style={styles.planSummary}>
              {guide.tenMinutePlan.summary}
            </Text>
            {guide.tenMinutePlan.movements.map((m, i) => (
              <View key={i} style={styles.movementRow} wrap={false}>
                <Text style={styles.movementMark}>+</Text>
                <Text style={styles.movementText}>
                  {m.name}:{" "}
                  <Text style={styles.movementDetail}>{m.detail}</Text>
                </Text>
              </View>
            ))}
          </View>

          {/* Right: daily checklist + top 3 numbers */}
          <View style={styles.colRight}>
            <Text style={styles.sectionLabel}>Daily checklist</Text>
            {guide.trackers.dailyChecklist.map((item, i) => (
              <View key={i} style={trackerStyles.checkRow} wrap={false}>
                <Text style={trackerStyles.checkBox}>[  ]</Text>
                <Text style={trackerStyles.checkLabel}>{item}</Text>
              </View>
            ))}

            <Text style={styles.sectionLabel}>Your top 3 numbers</Text>
            <Text style={styles.metricsNote}>
              Estimated from your scan, not measured. Targets are goals.
            </Text>
            {/* Mini header */}
            <View style={styles.metricsHeaderRow}>
              <Text style={[styles.metricLabel, { color: C.accentDim }]}>Metric</Text>
              <Text style={[styles.metricBand, { color: C.accentDim }]}>Now (est.)</Text>
              <Text style={[styles.metricTarget, { color: C.accentDim }]}>Target</Text>
            </View>
            {top3Metrics.map((m, i) => (
              <View key={i} style={styles.metricRow} wrap={false}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricBand}>{m.startingBand}</Text>
                <Text style={styles.metricTarget}>{m.target}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <View style={styles.rule} />
        <Text style={styles.footerNote}>
          Second Wind Protocol - built from your scan - vivrun.com
        </Text>
      </Page>
    </Document>
  );
}
