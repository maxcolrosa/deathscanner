/**
 * pdf-shared.tsx
 *
 * Shared font registration, monitor palette, and tracker-rendering helpers
 * imported by both guide-pdf.tsx (workbook) and tracker-pack-pdf.tsx.
 *
 * HARD CONSTRAINT: do NOT add `fixed` to any element here or in any consumer.
 * @react-pdf 4.x throws "unsupported number" across many auto-broken pages
 * whenever a `fixed` element exists, which 500s the PDF routes.
 */

import fs from "node:fs";
import path from "node:path";
import { Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { GuideDoc, GroceryAisle } from "@/lib/guide/schema";

/* ─── Fonts ───────────────────────────────────────────────────────────────────
   Register the real Geist family once. Consumers import SANS / MONO for
   fontFamily references. Falls back to built-in PDF fonts when TTFs are absent
   (e.g. CI/test environments) so rendering never hard-fails. */
const FONT_DIR = path.join(process.cwd(), "node_modules/geist/dist/fonts");
export const FONTS_OK = (() => {
  try {
    return fs.existsSync(path.join(FONT_DIR, "geist-sans/Geist-Regular.ttf"));
  } catch {
    return false;
  }
})();

if (FONTS_OK) {
  Font.register({
    family: "Geist",
    fonts: [
      { src: path.join(FONT_DIR, "geist-sans/Geist-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "geist-sans/Geist-Medium.ttf"), fontWeight: 500 },
      { src: path.join(FONT_DIR, "geist-sans/Geist-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(FONT_DIR, "geist-sans/Geist-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "GeistMono",
    fonts: [
      { src: path.join(FONT_DIR, "geist-mono/GeistMono-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "geist-mono/GeistMono-Medium.ttf"), fontWeight: 500 },
    ],
  });
}
// Keep words intact: react-pdf hyphenates mid-word by default.
Font.registerHyphenationCallback((word) => [word]);

export const SANS = FONTS_OK ? "Geist" : "Helvetica";
export const MONO = FONTS_OK ? "GeistMono" : "Courier";

/* ─── Monitor palette (mirrors app/globals.css) ─────────────────────────────── */
export const C = {
  bg: "#070b0d",
  panel: "#0c1418",
  line: "#16242b",
  fg: "#d7e3e6",
  muted: "#6b8088",
  accent: "#2ee6c9",
  accentDim: "#1c8377",
  alert: "#ff453a",
} as const;

/* ─── Tracker shared styles ─────────────────────────────────────────────────── */
export const trackerStyles = StyleSheet.create({
  /* Section header inside tracker documents */
  trackerSectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    marginTop: 4,
  },
  trackerSectionTitle: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: C.muted,
  },
  trackerSectionLine: { flex: 1, height: 0.75, backgroundColor: C.line },

  /* Grid */
  gridRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.line },
  gridHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.accentDim,
    marginBottom: 2,
  },
  gridHeaderCell: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.accentDim,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  gridCell: {
    fontFamily: MONO,
    fontSize: 8,
    color: C.muted,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  gridCellBlank: {
    fontFamily: MONO,
    fontSize: 8,
    color: C.line,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },

  /* Grocery checklist */
  aisleHeader: {
    fontFamily: MONO,
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: C.accent,
    marginTop: 10,
    marginBottom: 4,
  },
  checkRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  checkBox: {
    fontFamily: MONO,
    fontSize: 8.5,
    color: C.accentDim,
    width: 22,
    marginTop: 1,
  },
  checkLabel: {
    fontFamily: SANS,
    fontSize: 9,
    color: C.fg,
    flex: 1,
  },

  /* Tracker page title */
  trackerPageTitle: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 16,
    color: C.fg,
    marginBottom: 4,
  },
  trackerPageSub: {
    fontFamily: MONO,
    fontSize: 8.5,
    color: C.muted,
    marginBottom: 16,
  },

  /* Divider rule */
  rule: { borderBottomWidth: 0.75, borderBottomColor: C.line, marginVertical: 12 },

  /* Label */
  label: {
    fontFamily: MONO,
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: C.accent,
    marginTop: 14,
    marginBottom: 5,
  },

  /* WorkoutLogGrid: workout title block */
  workoutTitleBlock: {
    backgroundColor: C.panel,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderLeftWidth: 2,
    borderLeftColor: C.accent,
    marginBottom: 2,
  },
  workoutTitleText: {
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 9.5,
    color: C.fg,
  },
});

/* ─── Tracker render helpers (shared between workbook and tracker-pack) ────── */

/**
 * Workout log grid.
 * For each session (workout) in guide.training.workouts, renders a header row
 * (exercise | W | Wt | Reps done) and one blank-cell row per exercise.
 * wrap={false} on each atomic workout block keeps a workout together.
 * Do NOT wrap={false} the whole grid -- it can be very long.
 */
export function WorkoutLogGrid({ guide }: { guide: GuideDoc }) {
  return (
    <View>
      <Text style={trackerStyles.trackerPageTitle}>Workout Log</Text>
      <Text style={trackerStyles.trackerPageSub}>
        Print one copy per week. Fill in weight used and reps completed.
      </Text>
      {guide.training.workouts.map((wo, wi) => (
        <View key={wi} wrap={false} style={{ marginBottom: 14 }}>
          {/* Workout title row */}
          <View style={trackerStyles.workoutTitleBlock}>
            <Text style={trackerStyles.workoutTitleText}>
              {wo.day}: {wo.title}
            </Text>
          </View>
          {/* Header */}
          <View style={trackerStyles.gridHeaderRow}>
            <Text style={[trackerStyles.gridHeaderCell, { flex: 3 }]}>Exercise</Text>
            <Text style={[trackerStyles.gridHeaderCell, { width: 22 }]}>W</Text>
            <Text style={[trackerStyles.gridHeaderCell, { width: 44 }]}>Weight</Text>
            <Text style={[trackerStyles.gridHeaderCell, { width: 60 }]}>Reps done</Text>
          </View>
          {wo.exercises.map((ex, ei) => (
            <View key={ei} style={trackerStyles.gridRow}>
              <Text style={[trackerStyles.gridCell, { flex: 3 }]}>{ex.name}</Text>
              <Text style={[trackerStyles.gridCellBlank, { width: 22 }]}>__</Text>
              <Text style={[trackerStyles.gridCellBlank, { width: 44 }]}>________</Text>
              <Text style={[trackerStyles.gridCellBlank, { width: 60 }]}>__________</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Weekly habit tracker grid.
 * Habits down the left side, Mon-Sun columns across.
 * Wraps between rows so pages can break naturally.
 */
export function WeeklyHabitGrid({ guide }: { guide: GuideDoc }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // Deduplicate habit names across the 8 weeks for a compact list.
  const seen = new Set<string>();
  const habits: string[] = [];
  for (const w of guide.weeks) {
    if (!seen.has(w.habit.name)) {
      seen.add(w.habit.name);
      habits.push(w.habit.name);
    }
  }
  return (
    <View>
      <Text style={trackerStyles.trackerPageTitle}>Weekly Habit Tracker</Text>
      <Text style={trackerStyles.trackerPageSub}>
        Tick each day you complete the habit. One grid covers one week.
      </Text>
      {/* Header */}
      <View style={trackerStyles.gridHeaderRow}>
        <Text style={[trackerStyles.gridHeaderCell, { flex: 4 }]}>Habit</Text>
        {days.map((d) => (
          <Text key={d} style={[trackerStyles.gridHeaderCell, { width: 28 }]}>
            {d}
          </Text>
        ))}
      </View>
      {habits.map((name, hi) => (
        <View key={hi} style={trackerStyles.gridRow} wrap={false}>
          <Text style={[trackerStyles.gridCell, { flex: 4 }]}>{name}</Text>
          {days.map((d) => (
            <Text key={d} style={[trackerStyles.gridCellBlank, { width: 28 }]}>
              [ ]
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * 8-week measurement tracker grid.
 * Rows: Waist, Weight, Resting HR, Energy 1-5.
 * Columns: Week 1 through 8 (blank).
 */
export function MeasurementTrackerGrid() {
  const rows = ["Waist (cm)", "Weight (kg)", "Resting HR (bpm)", "Energy (1-5)"];
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  return (
    <View>
      <Text style={trackerStyles.trackerPageTitle}>8-Week Measurement Tracker</Text>
      <Text style={trackerStyles.trackerPageSub}>
        Measure on the same morning each week, before eating.
      </Text>
      {/* Header */}
      <View style={trackerStyles.gridHeaderRow}>
        <Text style={[trackerStyles.gridHeaderCell, { flex: 3 }]}>Metric</Text>
        {weeks.map((w) => (
          <Text key={w} style={[trackerStyles.gridHeaderCell, { width: 34 }]}>
            {w}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={trackerStyles.gridRow} wrap={false}>
          <Text style={[trackerStyles.gridCell, { flex: 3 }]}>{row}</Text>
          {weeks.map((w) => (
            <Text key={w} style={[trackerStyles.gridCellBlank, { width: 34 }]}>
              ____
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Grocery checklist, grouped by aisle.
 */
export function GroceryChecklist({ aisles }: { aisles: GroceryAisle[] }) {
  return (
    <View>
      <Text style={trackerStyles.trackerPageTitle}>Grocery Checklist</Text>
      <Text style={trackerStyles.trackerPageSub}>
        Print and bring to the store. Tick as you add to cart.
      </Text>
      {aisles.map((aisle, ai) => (
        <View key={ai} wrap={false}>
          <Text style={trackerStyles.aisleHeader}>{aisle.aisle}</Text>
          {aisle.items.map((item, ii) => (
            <View key={ii} style={trackerStyles.checkRow}>
              <Text style={trackerStyles.checkBox}>[  ]</Text>
              <Text style={trackerStyles.checkLabel}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Daily checklist card.
 */
export function DailyChecklistCard({ items }: { items: string[] }) {
  return (
    <View>
      <Text style={trackerStyles.trackerPageTitle}>Daily Checklist</Text>
      <Text style={trackerStyles.trackerPageSub}>
        Run through this every evening. Tick what you completed today.
      </Text>
      {items.map((item, i) => (
        <View key={i} style={trackerStyles.checkRow} wrap={false}>
          <Text style={trackerStyles.checkBox}>[  ]</Text>
          <Text style={trackerStyles.checkLabel}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Tracker section title row (used inside the workbook to label a tracker section).
 */
export function TrackerSectionHead({ title }: { title: string }) {
  return (
    <View style={trackerStyles.trackerSectionHead}>
      <Text style={trackerStyles.trackerSectionTitle}>{title}</Text>
      <View style={trackerStyles.trackerSectionLine} />
    </View>
  );
}
