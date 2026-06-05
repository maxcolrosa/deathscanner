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
import type {
  GuideDoc,
  GroceryAisle,
  Recipe,
  ExerciseEntry,
  ScienceEntry,
  ProgramPhase,
  MonthlyReview,
} from "@/lib/guide/schema";

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
  // Deduplicate habit names across the weeks for a compact list.
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
 * 90-day (12-week) measurement tracker grid.
 * Rows: Waist, Weight, Resting HR, Energy 1-5.
 * Columns: Week 1 through 12 (blank). Cell width is slightly narrower
 * than the old 8-col version so the grid fits within A4 page width.
 */
export function MeasurementTrackerGrid() {
  const rows = ["Waist (in)", "Weight (lbs)", "Resting HR (bpm)", "Energy (1-5)"];
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
  return (
    <View>
      <Text style={trackerStyles.trackerPageTitle}>90-Day Measurement Tracker</Text>
      <Text style={trackerStyles.trackerPageSub}>
        Measure on the same morning each week, before eating. Covers all 12 weeks of your program.
      </Text>
      {/* Header */}
      <View style={trackerStyles.gridHeaderRow}>
        <Text style={[trackerStyles.gridHeaderCell, { flex: 3 }]}>Metric</Text>
        {weeks.map((w) => (
          <Text key={w} style={[trackerStyles.gridHeaderCell, { width: 26 }]}>
            {w}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={trackerStyles.gridRow} wrap={false}>
          <Text style={[trackerStyles.gridCell, { flex: 3 }]}>{row}</Text>
          {weeks.map((w) => (
            <Text key={w} style={[trackerStyles.gridCellBlank, { width: 26 }]}>
              ___
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
        // wrap={false} keeps each aisle group on one page.
        // Safe because aisles hold a bounded number of items (a few to ~15).
        // If an aisle ever grows very large, remove wrap={false} here to allow it to split.
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

/* ─── Cover + section-header styles (shared by recipe-book-pdf and exercise-library-pdf) */
export const coverStyles = StyleSheet.create({
  /* Brand mark row at the top of the cover page */
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

  /* Section divider header (label + horizontal rule) */
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  sectionTitle: {
    fontFamily: MONO,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: C.muted,
  },
  sectionLine: { flex: 1, height: 0.75, backgroundColor: C.line },

  /* Generic muted caption line */
  muted: { fontSize: 9.5, color: C.muted, marginBottom: 12 },
});

/* ─── Shared styles for new content cards ───────────────────────────────────── */
export const contentStyles = StyleSheet.create({
  /* RecipeCard */
  recipeCard: {
    backgroundColor: C.panel,
    borderWidth: 0.75,
    borderColor: C.line,
    borderLeftWidth: 2,
    borderLeftColor: C.accent,
    padding: 12,
    marginBottom: 12,
  },
  recipeTitle: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 11,
    color: C.fg,
    marginBottom: 4,
  },
  recipeBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  recipeBadge: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: C.accentDim,
    borderWidth: 0.5,
    borderColor: C.accentDim,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  recipeSectionLabel: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.muted,
    marginTop: 6,
    marginBottom: 3,
  },
  recipeItem: {
    fontFamily: SANS,
    fontSize: 9,
    color: C.fg,
    marginBottom: 2,
  },
  recipeStep: {
    flexDirection: "row",
    marginBottom: 3,
  },
  recipeStepNum: {
    fontFamily: MONO,
    fontSize: 8.5,
    color: C.accentDim,
    width: 18,
  },
  recipeStepText: {
    fontFamily: SANS,
    fontSize: 9,
    color: C.fg,
    flex: 1,
  },
  recipeNote: {
    fontFamily: SANS,
    fontSize: 8.5,
    color: C.muted,
    marginTop: 4,
    paddingLeft: 4,
    borderLeftWidth: 1.5,
    borderLeftColor: C.accentDim,
  },

  /* ExerciseEntryCard */
  exerciseCard: {
    backgroundColor: C.panel,
    borderWidth: 0.75,
    borderColor: C.line,
    borderLeftWidth: 2,
    borderLeftColor: C.accent,
    padding: 12,
    marginBottom: 12,
  },
  exerciseTitle: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 11,
    color: C.fg,
    marginBottom: 2,
  },
  exerciseMeta: {
    fontFamily: MONO,
    fontSize: 8,
    color: C.accentDim,
    marginBottom: 6,
  },
  exerciseSectionLabel: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.muted,
    marginTop: 5,
    marginBottom: 3,
  },
  exerciseItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  exerciseMark: {
    fontFamily: MONO,
    fontSize: 9,
    color: C.accent,
    width: 12,
  },
  exerciseItemText: {
    fontFamily: SANS,
    fontSize: 9,
    color: C.fg,
    flex: 1,
  },
  exerciseModLine: {
    fontFamily: SANS,
    fontSize: 8.5,
    color: C.muted,
    marginTop: 4,
  },
  exerciseModLabel: {
    fontFamily: MONO,
    fontSize: 8,
    color: C.accentDim,
  },
  exerciseLearn: {
    fontFamily: SANS,
    fontSize: 8.5,
    color: C.muted,
    marginTop: 3,
  },

  /* ScienceEntryRow */
  scienceRow: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
    paddingVertical: 10,
  },
  scienceLever: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 10.5,
    color: C.accent,
    marginBottom: 4,
  },
  scienceLabel: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 2,
    marginTop: 5,
  },
  scienceText: {
    fontFamily: SANS,
    fontSize: 9.5,
    color: C.fg,
    lineHeight: 1.5,
  },

  /* PhaseRow */
  phaseRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
    paddingVertical: 8,
  },
  phaseTag: {
    fontFamily: MONO,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: C.accentDim,
    width: 80,
    marginTop: 2,
  },
  phaseBody: {
    flex: 1,
  },
  phaseName: {
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 10.5,
    color: C.fg,
    marginBottom: 2,
  },
  phaseFocus: {
    fontFamily: SANS,
    fontSize: 9,
    color: C.muted,
    marginBottom: 2,
  },
  phaseChanges: {
    fontFamily: SANS,
    fontSize: 9,
    color: C.fg,
  },

  /* MonthlyReviewRow */
  reviewBlock: {
    backgroundColor: C.panel,
    borderLeftWidth: 2,
    borderLeftColor: C.accentDim,
    padding: 10,
    marginBottom: 10,
  },
  reviewMonth: {
    fontFamily: MONO,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.accentDim,
    marginBottom: 6,
  },
  reviewLabel: {
    fontFamily: MONO,
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: C.muted,
    marginTop: 5,
    marginBottom: 3,
  },
  reviewItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  reviewMark: {
    fontFamily: MONO,
    fontSize: 9,
    color: C.accent,
    width: 12,
  },
  reviewItemText: {
    fontFamily: SANS,
    fontSize: 9,
    color: C.fg,
    flex: 1,
  },

  /* Meal group heading for recipe book */
  mealGroupHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    marginTop: 6,
  },
  mealGroupTitle: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: C.muted,
  },
  mealGroupLine: {
    flex: 1,
    height: 0.75,
    backgroundColor: C.line,
  },

  /* Pattern group heading for exercise library */
  patternGroupHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    marginTop: 6,
  },
  patternGroupTitle: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: C.muted,
  },
  patternGroupLine: {
    flex: 1,
    height: 0.75,
    backgroundColor: C.line,
  },
});

/* ─── New shared render components ──────────────────────────────────────────── */

/**
 * RecipeCard - renders one recipe with name, meal/time/macro badges (estimated),
 * ingredients list, numbered steps, and optional note.
 * wrap={false} only on the card itself (each card is an atomic block).
 */
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <View style={contentStyles.recipeCard} wrap={false}>
      <Text style={contentStyles.recipeTitle}>{recipe.name}</Text>
      <View style={contentStyles.recipeBadgeRow}>
        <Text style={contentStyles.recipeBadge}>{recipe.meal}</Text>
        <Text style={contentStyles.recipeBadge}>{recipe.timeMins} min</Text>
        <Text style={contentStyles.recipeBadge}>Serves {recipe.servings}</Text>
        <Text style={contentStyles.recipeBadge}>~{recipe.calories} cal est.</Text>
        <Text style={contentStyles.recipeBadge}>~{recipe.proteinG}g protein est.</Text>
        {recipe.tags.map((tag, i) => (
          <Text key={i} style={contentStyles.recipeBadge}>{tag}</Text>
        ))}
      </View>
      <Text style={contentStyles.recipeSectionLabel}>Ingredients</Text>
      {recipe.ingredients.map((ing, i) => (
        <Text key={i} style={contentStyles.recipeItem}>
          {"•"} {ing}
        </Text>
      ))}
      <Text style={contentStyles.recipeSectionLabel}>Method</Text>
      {recipe.steps.map((step, i) => (
        <View key={i} style={contentStyles.recipeStep}>
          <Text style={contentStyles.recipeStepNum}>{i + 1}.</Text>
          <Text style={contentStyles.recipeStepText}>{step}</Text>
        </View>
      ))}
      {recipe.note ? (
        <Text style={contentStyles.recipeNote}>{recipe.note}</Text>
      ) : null}
    </View>
  );
}

/**
 * ExerciseEntryCard - renders one exercise with name, pattern, targets,
 * setup/execution/mistakes lists, easier/harder progressions, and learn cue.
 * wrap={false} on the card keeps each entry together.
 */
export function ExerciseEntryCard({ entry }: { entry: ExerciseEntry }) {
  return (
    <View style={contentStyles.exerciseCard} wrap={false}>
      <Text style={contentStyles.exerciseTitle}>{entry.name}</Text>
      <Text style={contentStyles.exerciseMeta}>
        {entry.pattern} | {entry.targets}
      </Text>
      <Text style={contentStyles.exerciseSectionLabel}>Setup</Text>
      {entry.setup.map((s, i) => (
        <View key={i} style={contentStyles.exerciseItem}>
          <Text style={contentStyles.exerciseMark}>+</Text>
          <Text style={contentStyles.exerciseItemText}>{s}</Text>
        </View>
      ))}
      <Text style={contentStyles.exerciseSectionLabel}>Execution</Text>
      {entry.execution.map((s, i) => (
        <View key={i} style={contentStyles.exerciseItem}>
          <Text style={contentStyles.exerciseMark}>+</Text>
          <Text style={contentStyles.exerciseItemText}>{s}</Text>
        </View>
      ))}
      <Text style={contentStyles.exerciseSectionLabel}>Common mistakes</Text>
      {entry.mistakes.map((s, i) => (
        <View key={i} style={contentStyles.exerciseItem}>
          <Text style={contentStyles.exerciseMark}>!</Text>
          <Text style={contentStyles.exerciseItemText}>{s}</Text>
        </View>
      ))}
      <Text style={contentStyles.exerciseModLine}>
        <Text style={contentStyles.exerciseModLabel}>Easier: </Text>
        {entry.easier}
      </Text>
      <Text style={contentStyles.exerciseModLine}>
        <Text style={contentStyles.exerciseModLabel}>Harder: </Text>
        {entry.harder}
      </Text>
      <Text style={contentStyles.exerciseLearn}>
        <Text style={contentStyles.exerciseModLabel}>How to learn it: </Text>
        {entry.learn}
      </Text>
    </View>
  );
}

/**
 * ScienceEntryRow - renders one science lever entry with lever heading,
 * mechanism explanation, and evidence summary.
 */
export function ScienceEntryRow({ entry }: { entry: ScienceEntry }) {
  return (
    <View style={contentStyles.scienceRow}>
      <Text style={contentStyles.scienceLever}>{entry.lever}</Text>
      <Text style={contentStyles.scienceLabel}>Mechanism</Text>
      <Text style={contentStyles.scienceText}>{entry.mechanism}</Text>
      <Text style={contentStyles.scienceLabel}>Evidence</Text>
      <Text style={contentStyles.scienceText}>{entry.evidence}</Text>
    </View>
  );
}

/**
 * PhaseRow - renders one program arc phase (name, weeks, focus, whatChanges).
 */
export function PhaseRow({ phase }: { phase: ProgramPhase }) {
  return (
    <View style={contentStyles.phaseRow} wrap={false}>
      <Text style={contentStyles.phaseTag}>{phase.weeks}</Text>
      <View style={contentStyles.phaseBody}>
        <Text style={contentStyles.phaseName}>{phase.name}</Text>
        <Text style={contentStyles.phaseFocus}>{phase.focus}</Text>
        <Text style={contentStyles.phaseChanges}>{phase.whatChanges}</Text>
      </View>
    </View>
  );
}

/**
 * MonthlyReviewRow - renders one monthly review block with checkpoints
 * and decision rules.
 */
export function MonthlyReviewRow({ review }: { review: MonthlyReview }) {
  return (
    <View style={contentStyles.reviewBlock} wrap={false}>
      <Text style={contentStyles.reviewMonth}>{review.month}</Text>
      <Text style={contentStyles.reviewLabel}>Checkpoints</Text>
      {review.checkpoints.map((cp, i) => (
        <View key={i} style={contentStyles.reviewItem}>
          <Text style={contentStyles.reviewMark}>+</Text>
          <Text style={contentStyles.reviewItemText}>{cp}</Text>
        </View>
      ))}
      <Text style={contentStyles.reviewLabel}>Adjust rules</Text>
      {review.adjustRules.map((rule, i) => (
        <View key={i} style={contentStyles.reviewItem}>
          <Text style={contentStyles.reviewMark}>{">"}</Text>
          <Text style={contentStyles.reviewItemText}>{rule}</Text>
        </View>
      ))}
    </View>
  );
}
