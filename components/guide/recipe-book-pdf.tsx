/**
 * recipe-book-pdf.tsx
 *
 * Standalone recipe book PDF for the Second Wind Protocol.
 * Contains every recipe in the user's recipe bank, grouped by meal type,
 * plus the full aisle-grouped shopping list.
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
  trackerStyles,
  RecipeCard,
} from "@/components/guide/pdf-shared";

/* ─── Brand ──────────────────────────────────────────────────────────────────── */
const BRAND = "LONGEVITY SCAN";

/* ─── Meal order ─────────────────────────────────────────────────────────────── */
const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

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

export function RecipeBookPdfDocument({ guide }: { guide: GuideDoc }) {
  const bank = guide.recipeBank;

  return (
    <Document
      title="Second Wind Protocol - Recipe Book"
      author={BRAND}
      subject="Your personalized recipe book from the Second Wind Protocol"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Cover ─────────────────────────────────────────────────────────── */}
        <View style={styles.coverMark}>
          <View style={styles.coverDot} />
          <Text style={styles.coverMarkText}>{BRAND}</Text>
        </View>
        <Text style={styles.coverKicker}>Recipe book</Text>
        <Text style={styles.coverTitle}>Second Wind Protocol Recipe Book</Text>
        <Text style={styles.coverIntro}>
          High-protein, whole-food recipes selected for your goal and dietary preferences.
          Every recipe includes estimated macros per serving to keep your nutrition on track.
        </Text>
        <View style={styles.coverRule} />
        <Text style={styles.coverNote}>
          Calorie and protein figures are per-serving estimates. Actual values vary with
          ingredients and portion sizes. Not medical or dietary advice.
        </Text>

        {/* ── Recipes grouped by meal ───────────────────────────────────────── */}
        {MEAL_ORDER.map((meal) => {
          const recipes = bank.recipes.filter((r) => r.meal === meal);
          if (recipes.length === 0) return null;
          return (
            <View key={meal} break>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>{MEAL_LABEL[meal]}</Text>
                <View style={styles.sectionLine} />
              </View>
              {recipes.map((recipe, i) => (
                <RecipeCard key={i} recipe={recipe} />
              ))}
            </View>
          );
        })}

        {/* ── Shopping list ─────────────────────────────────────────────────── */}
        <View break>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Shopping list</Text>
            <View style={styles.sectionLine} />
          </View>
          <Text style={styles.muted}>
            All ingredients across your recipes, grouped by supermarket aisle.
            Print and bring to the store.
          </Text>
          {bank.shoppingList.map((aisle, ai) => (
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
      </Page>
    </Document>
  );
}
