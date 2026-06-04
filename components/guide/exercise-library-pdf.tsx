/**
 * exercise-library-pdf.tsx
 *
 * Standalone exercise library PDF for the Second Wind Protocol.
 * Contains detailed form guides for every exercise in the user's library,
 * grouped by movement pattern.
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
  ExerciseEntryCard,
} from "@/components/guide/pdf-shared";

/* ─── Brand ──────────────────────────────────────────────────────────────────── */
const BRAND = "LONGEVITY SCAN";

/* ─── Pattern display order ─────────────────────────────────────────────────── */
const PATTERN_ORDER = [
  "Squat",
  "Hinge",
  "Push",
  "Pull",
  "Core",
  "Conditioning",
  "Mobility",
];

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

  /* Cover */
  coverMark: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 80 },
  coverDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent },
  coverMarkText: { fontFamily: MONO, fontSize: 8.5, letterSpacing: 2.2, color: C.fg },
  coverKicker: {
    fontFamily: MONO,
    fontSize: 8.5,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: C.accent,
    marginBottom: 14,
  },
  coverTitle: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 28,
    lineHeight: 1.12,
    letterSpacing: -0.4,
    color: C.fg,
    marginBottom: 14,
    maxWidth: 400,
  },
  coverIntro: {
    fontFamily: SANS,
    fontSize: 11,
    lineHeight: 1.6,
    color: C.muted,
    maxWidth: 400,
    marginBottom: 28,
  },
  coverRule: { borderBottomWidth: 0.75, borderBottomColor: C.line, marginBottom: 16 },
  coverNote: {
    fontFamily: MONO,
    fontSize: 8,
    color: C.muted,
  },

  /* Section header */
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionTitle: {
    fontFamily: MONO,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: C.muted,
  },
  sectionLine: { flex: 1, height: 0.75, backgroundColor: C.line },

  muted: { fontSize: 9.5, color: C.muted, marginBottom: 12 },
});

/* ─── Document ───────────────────────────────────────────────────────────────── */

export function ExerciseLibraryPdfDocument({ guide }: { guide: GuideDoc }) {
  const library = guide.exerciseLibrary;

  // Group entries by pattern. Patterns not in PATTERN_ORDER go into "Other".
  const grouped = new Map<string, typeof library>();
  for (const entry of library) {
    const key = PATTERN_ORDER.includes(entry.pattern) ? entry.pattern : "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  // Sort groups by PATTERN_ORDER (then "Other" last).
  const groupKeys = [
    ...PATTERN_ORDER.filter((p) => grouped.has(p)),
    ...(grouped.has("Other") ? ["Other"] : []),
  ];

  return (
    <Document
      title="Second Wind Protocol - Exercise Library"
      author={BRAND}
      subject="Your personalized exercise library from the Second Wind Protocol"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Cover ─────────────────────────────────────────────────────────── */}
        <View style={styles.coverMark}>
          <View style={styles.coverDot} />
          <Text style={styles.coverMarkText}>{BRAND}</Text>
        </View>
        <Text style={styles.coverKicker}>Exercise library</Text>
        <Text style={styles.coverTitle}>Second Wind Protocol Exercise Library</Text>
        <Text style={styles.coverIntro}>
          Detailed form guides for every movement in your program. Read setup and
          execution cues before your first session. Return to the mistakes section
          whenever something feels off.
        </Text>
        <View style={styles.coverRule} />
        <Text style={styles.coverNote}>
          These are general exercise descriptions, not medical or physiotherapy advice.
          If you have pain or an existing injury, consult a qualified professional before
          starting a new exercise.
        </Text>

        {/* ── Exercises grouped by movement pattern ────────────────────────── */}
        {groupKeys.map((pattern, gi) => {
          const entries = grouped.get(pattern)!;
          return (
            <View key={pattern} break={gi > 0}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>{pattern} pattern</Text>
                <View style={styles.sectionLine} />
              </View>
              {entries.map((entry, i) => (
                <ExerciseEntryCard key={i} entry={entry} />
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
