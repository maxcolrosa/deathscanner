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
  C,
  coverStyles,
  ExerciseEntryCard,
} from "@/components/guide/pdf-shared";

/* ─── Brand ──────────────────────────────────────────────────────────────────── */
const BRAND = "VIVRUN";

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
// Cover and section-header styles live in coverStyles (pdf-shared.tsx).
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
        <View style={coverStyles.coverMark}>
          <View style={coverStyles.coverDot} />
          <Text style={coverStyles.coverMarkText}>{BRAND}</Text>
        </View>
        <Text style={coverStyles.coverKicker}>Exercise library</Text>
        <Text style={coverStyles.coverTitle}>Second Wind Protocol Exercise Library</Text>
        <Text style={coverStyles.coverIntro}>
          Detailed form guides for every movement in your program. Read setup and
          execution cues before your first session. Return to the mistakes section
          whenever something feels off.
        </Text>
        <View style={coverStyles.coverRule} />
        <Text style={coverStyles.coverNote}>
          These are general exercise descriptions, not medical or physiotherapy advice.
          If you have pain or an existing injury, consult a qualified professional before
          starting a new exercise.
        </Text>

        {/* ── Exercises grouped by movement pattern ────────────────────────── */}
        {groupKeys.map((pattern, gi) => {
          const entries = grouped.get(pattern)!;
          return (
            <View key={pattern} break={gi > 0}>
              <View style={coverStyles.sectionHead}>
                <Text style={coverStyles.sectionTitle}>{pattern} pattern</Text>
                <View style={coverStyles.sectionLine} />
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
